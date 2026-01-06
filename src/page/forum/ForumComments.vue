<template>
    <div class="comments-section">
        <h2 class="comments-title">
            <ElIcon><ChatDotRound /></ElIcon>
            评论 ({{ comments.length }})
        </h2>

        <!-- 发表评论 -->
        <div class="comment-form">
            <div class="comment-editor">
                <ElInput
                    type="textarea"
                    v-model="newComment"
                    :rows="4"
                    placeholder="写下你的评论... (支持 Markdown)"
                />
                <div class="comment-actions">
                    <ElButton @click="clearComment" size="small">清空</ElButton>
                    <ElButton type="primary" @click="submitComment" icon="Promotion" size="small">发表评论</ElButton>
                </div>
            </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
            <div
                v-for="item in comments"
                :key="item.comment.commentId"
                class="comment-item"
            >
                <div class="comment-avatar">
                    <el-avatar
                        shape="circle"
                        :size="41"
                        :src="getUserInfo(item.comment.uid, 'avatar')"
                    />
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">{{ getUserInfo(item.comment.uid, 'nickname') }}</span>
                        <span class="comment-date">{{ item.comment.commentTime }}</span>
                        <div class="comment-actions">
                            <ElButton
                                type="text"
                                size="small"
                                @click="replyToComment(item.comment)"
                                v-if="item.comment.parentId === 0"
                            >
                                回复
                            </ElButton>
                            <ElButton
                                type="danger"
                                size="small"
                                text
                                @click="deleteComment(item.comment)"
                                v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === item.comment.uid)"
                            >
                                删除
                            </ElButton>
                        </div>
                    </div>
                    <div class="comment-body markdown" v-html="commentContentHtml(item.comment.content)"></div>

                    <!-- 内嵌回复编辑框（回复顶层评论时显示在这里） -->
                    <div
                        v-if="replyTarget && replyTarget.commentId === item.comment.commentId"
                        class="reply-editor"
                    >
                        <ElInput
                            v-model="replyContent"
                            type="textarea"
                            :rows="3"
                            placeholder="回复内容..."
                        />
                        <div class="reply-editor-actions">
                            <ElButton size="small" @click="cancelReply">取消</ElButton>
                            <ElButton type="primary" size="small" @click="submitReply(item)">
                                发送回复
                            </ElButton>
                        </div>
                    </div>

                    <!-- 回复列表 -->
                    <div v-if="item.replies && item.replies.length > 0" class="comment-replies">
                        <div
                            v-for="reply in item.replies"
                            :key="reply.commentId"
                            class="reply-item"
                        >
                            <div class="reply-avatar">
                                <el-avatar
                                    shape="circle"
                                    :size="27"
                                    :src="getUserInfo(reply.uid, 'avatar')"
                                />
                            </div>
                            <div class="reply-content">
                                <div class="reply-header">
                                    <span class="reply-author">{{ getUserInfo(reply.uid, 'nickname') }}</span>
                                    <span class="reply-date">{{ reply.commentTime }}</span>
                                    <ElButton
                                        type="text"
                                        size="small"
                                        @click="replyToComment(reply)"
                                    >
                                        回复
                                    </ElButton>
                                    <ElButton
                                        type="danger"
                                        size="small"
                                        text
                                        @click="deleteReply(reply)"
                                        v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === reply.uid)"
                                    >
                                        删除
                                    </ElButton>
                                </div>

                                <div class="reply-body markdown" v-html="commentContentHtml(reply.content)"></div>

                                <!-- 内嵌回复编辑框（回复某条回复时显示在该回复下面） -->
                                <div
                                    v-if="replyTarget && replyTarget.commentId === reply.commentId"
                                    class="reply-editor"
                                >
                                    <ElInput
                                        v-model="replyContent"
                                        type="textarea"
                                        :rows="3"
                                        placeholder="回复内容..."
                                    />
                                    <div class="reply-editor-actions">
                                        <ElButton size="small" @click="cancelReply">取消</ElButton>
                                        <ElButton type="primary" size="small" @click="submitReply(item)">
                                            发送回复
                                        </ElButton>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 显示更多按钮 -->
                        <div
                            v-if="getReplyPagination(item.comment.commentId).hasMore && !getReplyPagination(item.comment.commentId).isExpanded"
                            class="show-more-replies"
                        >
                            <ElButton
                                type="primary"
                                link
                                @click="showMoreReplies(item)"
                            >
                                显示全部 {{ getReplyPagination(item.comment.commentId).total }} 条回复
                            </ElButton>
                        </div>

                        <!-- 分页组件 -->
                        <div
                            v-if="getReplyPagination(item.comment.commentId).isExpanded && getReplyPagination(item.comment.commentId).total > 10"
                            class="reply-pagination"
                        >
                            <el-pagination
                                :current-page="getReplyPagination(item.comment.commentId).pageNo"
                                :page-size="10"
                                :total="getReplyPagination(item.comment.commentId).total"
                                layout="prev, pager, next"
                                small
                                @current-change="(page) => changeReplyPage(item, page)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <FooterPagination
            @pagerChange="pageChange"
            :pager-option="commentPager"/>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia";
import {onMounted, ref, watch} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {marked} from "marked";
import FooterPagination from "@/layout/FooterPagination.vue";
import forumApi from "@/api/forumApi.ts";
import userApi from "@/api/userApi.ts";
import commentApi from "@/api/commentApi.ts";

const props = defineProps<{
    comments: any[]
    luntanId: number
}>()

const emit = defineEmits<{
    (e: 'update:comments', comments: any[]): void
    (e: 'commentCountChange', count: number): void
}>()

const store = useProjectStore()

// 用户信息缓存
const userCache = ref({})

// 评论相关状态
const newComment = ref('')
const commentPager = ref({
    pageSize: 20,
    pageNo: 1,
    total: 0
})

// 回复相关状态
const replyTarget = ref<any | null>(null)
const replyContent = ref('')

// 回复分页状态管理（为每个主评论维护独立的分页状态）
const replyPaginationMap = ref<Map<number, {
    total: number
    pageNo: number
    pageSize: number
    hasMore: boolean
    isExpanded: boolean
}>>(new Map())

// 加载用户信息并缓存
const loadUserInfo = async (uid: number) => {
    // 如果缓存中已有数据，直接返回
    if (userCache.value[uid]) {
        return userCache.value[uid]
    }

    try {
        const res = await userApi.getAvatarAndNickname(uid)
        // 缓存用户信息
        userCache.value[uid] = res.data
        return res.data
    } catch (err) {
        console.error('获取用户信息失败:', err)
        userCache.value[uid] = { avatar: '', nickname: '未知用户' }
        return { avatar: '', nickname: '未知用户' }
    }
}

// 获取用户头像或昵称
const getUserInfo = (uid: number, which: 'avatar' | 'nickname') => {
    if (userCache.value[uid]) {
        return which === 'avatar' ? userCache.value[uid].avatar : userCache.value[uid].nickname
    }
    // 如果还没有加载完成，返回默认值
    return which === 'avatar' ? '' : '加载中...'
}

// 预加载评论作者信息
const preloadUserInfo = () => {
    props.comments.forEach(item => {
        loadUserInfo(item.comment.uid)
        if (item.replies) {
            item.replies.forEach((reply: any) => {
                loadUserInfo(reply.uid)
            })
        }
    })
}

// 初始化回复分页状态
const initializeReplyPagination = () => {
    props.comments.forEach(item => {
        const commentId = item.comment.commentId
        // 如果还没有初始化过这个评论的分页状态
        if (!replyPaginationMap.value.has(commentId)) {
            const repliesCount = item.replies?.length || 0
            replyPaginationMap.value.set(commentId, {
                total: repliesCount >= 3 ? repliesCount + 1 : repliesCount, // 如果有3条，说明可能还有更多
                pageNo: 1,
                pageSize: 10,
                hasMore: repliesCount >= 3,
                isExpanded: false
            })
        }
    })
}

// 获取某个评论的分页状态
const getReplyPagination = (commentId: number) => {
    return replyPaginationMap.value.get(commentId) || {
        total: 0,
        pageNo: 1,
        pageSize: 10,
        hasMore: false,
        isExpanded: false
    }
}

// 监听 comments 变化，预加载用户信息
watch(() => props.comments, () => {
    preloadUserInfo()
    commentPager.value.total = props.comments.length
    initializeReplyPagination()
}, { immediate: true, deep: true })

onMounted(() => {
    commentPager.value.total = props.comments.length
    preloadUserInfo()
    initializeReplyPagination()
})

// 显示更多回复
const showMoreReplies = async (item: any) => {
    const commentId = item.comment.commentId
    const pagination = getReplyPagination(commentId)

    try {
        const res = await commentApi.getChildComments(commentId, 1, 10)
        if (res.data) {
            // 更新回复列表
            item.replies = res.data.comments

            // 更新分页状态
            replyPaginationMap.value.set(commentId, {
                total: res.data.total,
                pageNo: res.data.pageNo,
                pageSize: res.data.pageSize,
                hasMore: res.data.total > 10,
                isExpanded: true
            })

            // 预加载用户信息
            item.replies.forEach((reply: any) => {
                loadUserInfo(reply.uid)
            })
        }
    } catch (err) {
        ElMessage.error('加载回复失败')
    }
}

// 切换回复页码
const changeReplyPage = async (item: any, pageNo: number) => {
    const commentId = item.comment.commentId
    const pagination = getReplyPagination(commentId)

    try {
        const res = await commentApi.getChildComments(commentId, pageNo, 10)
        if (res.data) {
            // 更新回复列表
            item.replies = res.data.comments

            // 更新分页状态
            replyPaginationMap.value.set(commentId, {
                total: res.data.total,
                pageNo: res.data.pageNo,
                pageSize: res.data.pageSize,
                hasMore: res.data.total > 10,
                isExpanded: true
            })

            // 预加载用户信息
            item.replies.forEach((reply: any) => {
                loadUserInfo(reply.uid)
            })
        }
    } catch (err) {
        ElMessage.error('加载回复失败')
    }
}

function commentContentHtml(content: string) {
    return marked.parse(content || '')
}

function submitComment() {
    if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }

    const commentRequest = {
        luntanId: props.luntanId,
        content: newComment.value,
        parentId: 0 // 0 表示一级评论
    }

    commentApi.addComment(commentRequest).then(res => {
        // 保存当前输入的内容
        const contentText = newComment.value

        // 构造完整的评论对象
        const commentEntity = {
            commentId: res.data.commentId,
            luntanId: props.luntanId,
            content: contentText,
            uid: res.data.uid,
            parentId: 0,
            commentTime: res.data.commentTime || new Date().toISOString().replace('T', ' ').slice(0, 19)
        }

        // 包装成 BundleComment 格式
        const bundleComment = {
            comment: commentEntity,
            replies: []
        }

        // 添加到评论列表
        const newComments = [...props.comments, bundleComment]
        emit('update:comments', newComments)
        emit('commentCountChange', newComments.length)
        commentPager.value.total = newComments.length

        // 预加载当前用户信息
        loadUserInfo(commentEntity.uid)

        // 初始化该评论的分页状态
        replyPaginationMap.value.set(commentEntity.commentId, {
            total: 0,
            pageNo: 1,
            pageSize: 10,
            hasMore: false,
            isExpanded: false
        })

        // 清空输入框
        newComment.value = ''
        ElMessage.success('评论发表成功！')
    }).catch(err => {
        ElMessage.error('评论发表失败，请稍后重试')
    })
}

function clearComment() {
    newComment.value = ''
}

function replyToComment(comment: any) {
    // 打开内嵌回复编辑框，并预填「回复 @用户名：」
    const nickname = getUserInfo(comment.uid, 'nickname') || '该用户'
    replyTarget.value = comment
    replyContent.value = `回复 @${nickname}：`
}

function cancelReply() {
    replyTarget.value = null
    replyContent.value = ''
}

function submitReply(itemWrapper: any) {
    if (!replyTarget.value) {
        return
    }

    if (!replyContent.value.trim()) {
        ElMessage.warning('请输入回复内容')
        return
    }

    const replyRequest = {
        luntanId: props.luntanId,
        content: replyContent.value,
        parentId: itemWrapper.comment.commentId, // 主评论的ID，所有回复都挂在主评论下
    }

    commentApi.addComment(replyRequest).then(res => {
        // 如果是首条评论，则临时创建一个回复列表
        if (!itemWrapper.replies) {
            itemWrapper.replies = []
        }

        // 构造完整的回复对象（使用后端返回的数据或本地构造）
        const newReply = {
            commentId: res.data?.commentId || Date.now(),
            luntanId: props.luntanId,
            content: replyContent.value,
            uid: store.authorization?.uid,
            parentId: itemWrapper.comment.commentId,
            commentTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }

        // 添加到回复列表
        itemWrapper.replies.push(newReply)

        // 预加载当前用户信息
        loadUserInfo(newReply.uid)

        // 清空回复框
        replyTarget.value = null
        replyContent.value = ''

        ElMessage.success('回复成功！')
    }).catch(err => {
        ElMessage.error('回复失败，请稍后重试')
    })
}

function deleteComment(comment: any) {
    ElMessageBox.confirm('确认删除这条评论？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const newComments = props.comments.filter(c => c.comment.commentId !== comment.commentId)
        emit('update:comments', newComments)
        emit('commentCountChange', newComments.length)
        commentPager.value.total = newComments.length
        ElMessage.success('删除成功！(静态演示)')
    })
}

function deleteReply(reply: any) {
    ElMessageBox.confirm('确认删除这条回复？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const newComments = props.comments.map(comment => {
            if (comment.replies) {
                comment.replies = comment.replies.filter((r: any) => r.commentId !== reply.commentId)
            }
            return comment
        })
        emit('update:comments', newComments)
        
        // 通知父组件评论数量变化
        const totalReplies = newComments.reduce((sum, item) => {
            return sum + 1 + (item.replies?.length || 0)
        }, 0)
        emit('commentCountChange', totalReplies)
        
        ElMessage.success('删除成功！(静态演示)')
    })
}

function pageChange() {
    // 分页处理
}
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.comments-section {
    .comments-title {
        font-size: 20px;
        color: $text-main;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
            color: $color-main;
        }
    }
}

.comment-form {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    .comment-editor {
        .comment-actions {
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
    }
}

.comments-list {
    .comment-item {
        background: white;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        display: flex;
        gap: 15px;
    }

    .comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: $bg-light;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $text-subtitle;
        flex-shrink: 0;
    }

    .comment-content {
        flex: 1;
    }

    .comment-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        .comment-author {
            font-weight: 600;
            color: $text-main;
        }

        .comment-date {
            font-size: 12px;
            color: $text-subtitle;
        }

        .comment-actions {
            margin-left: auto;
        }
    }

    .comment-body {
        color: $text-description;
        line-height: 1.6;
        margin-bottom: 10px;
    }

    .comment-replies {
        margin-top: 15px;
        padding-left: 20px;
        border-left: 3px solid $border-normal;
    }

    .reply-editor {
        margin-top: 10px;

        .reply-editor-actions {
            margin-top: 8px;
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
    }

    .reply-item {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
        padding: 12px;
        background: $bg-light;
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
            background: #f5f7fa;
        }
    }

    .reply-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $text-subtitle;
        flex-shrink: 0;
        font-size: 14px;
    }

    .reply-content {
        flex: 1;
    }

    .reply-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 5px;

        .reply-author {
            font-weight: 500;
            font-size: 13px;
            color: $text-main;
        }

        .reply-date {
            font-size: 11px;
            color: $text-subtitle;
        }
    }

    .reply-body {
        font-size: 14px;
        color: $text-main;
        line-height: 1.6;
        word-wrap: break-word;

        :deep(p) {
            margin: 0;
        }
    }

    .show-more-replies {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid $border-light;
        text-align: center;

        .el-button {
            font-size: 14px;
        }
    }

    .reply-pagination {
        margin-top: 15px;
        padding-top: 12px;
        border-top: 1px solid $border-light;
        display: flex;
        justify-content: center;

        :deep(.el-pagination) {
            .el-pager li {
                min-width: 28px;
                height: 28px;
                line-height: 28px;
                font-size: 13px;
            }

            .btn-prev,
            .btn-next {
                min-width: 28px;
                height: 28px;
                padding: 0 8px;
            }
        }
    }
}
</style>
