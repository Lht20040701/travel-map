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

                                <div class="reply-body" v-html="commentContentHtml(reply.content)"></div>

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

// 监听 comments 变化，预加载用户信息
watch(() => props.comments, () => {
    preloadUserInfo()
    commentPager.value.total = props.comments.length
}, { immediate: true, deep: true })

onMounted(() => {
    commentPager.value.total = props.comments.length
    preloadUserInfo()
})

function commentContentHtml(content: string) {
    return marked.parse(content || '')
}

function submitComment() {
    if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }

    // 静态演示
    const comment = {
        commentId: Date.now(),
        luntanId: props.luntanId,
        content: newComment.value,
        uid: store.authorization?.uid || 999,
        parentId: 0, // 0-一级评论
        commentTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        author: store.authorization?.nickname || '当前用户',
        replies: []
    }

    const newComments = [...props.comments, comment]
    emit('update:comments', newComments)
    emit('commentCountChange', newComments.length)
    commentPager.value.total = newComments.length
    newComment.value = ''
    ElMessage.success('评论发表成功！(静态演示)')
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

    const reply = {
        luntanId: props.luntanId,
        content: replyContent.value,
        parentId: itemWrapper.commentId, // 这里的id是主评论的id，不是回复评论的id
    }

    commentApi.addComment(reply)

    // 如果是首条评论，则临时创建一个回复列表
    if (!itemWrapper.replies) {
        itemWrapper.replies = []
    }

    // 这里回复成功后不再刷新列表了
    itemWrapper.replies.push(reply)

    // // 通知父组件评论数量变化
    // const totalReplies = props.comments.reduce((sum, item) => {
    //     return sum + 1 + (item.replies?.length || 0)
    // }, 0)
    // emit('commentCountChange', totalReplies)

    replyTarget.value = null
    replyContent.value = ''
    ElMessage.success('回复成功！(开发中)')
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
        margin-bottom: 10px;
        padding: 10px;
        background: $bg-light;
        border-radius: 6px;
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
        font-size: 13px;
        color: $text-description;
        line-height: 1.5;
    }
}
</style>
