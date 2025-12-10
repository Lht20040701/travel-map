<template>
    <div class="forum-detail">
        <Toolbar>
            <template #left>
                <ElButton @click="goBack" icon="ArrowLeft">返回列表</ElButton>
            </template>
            <template #center>
                <div class="topic-actions">
                    <ElButton
                        type="warning"
                        :icon="topic.isTop === 1 ? 'Bottom' : 'Top'"
                        @click="toggleTop"
                        v-if="store.isAdmin"
                    >
                        {{ topic.isTop === 1 ? '取消置顶' : '置顶' }}
                    </ElButton>
                    <ElButton
                        type="danger"
                        icon="Delete"
                        @click="deleteTopic"
                        v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === topic.uid)"
                    >
                        删除主题
                    </ElButton>
                </div>
            </template>
            <template #right></template>
        </Toolbar>

        <div class="detail-content">
            <!-- 主题内容 -->
            <div class="topic-card">
                <div class="topic-header">
                    <div class="topic-title-section">
                        <h1 class="topic-title">
                            <ElTag v-if="topic.isTop === 1" type="warning" size="small" effect="dark">置顶</ElTag>
                            <ElTag v-if="topic.category" :type="getCategoryType(topic.category)" size="small">
                                {{ getCategoryName(topic.category) }}
                            </ElTag>
                            {{ topic.title }}
                        </h1>
                        <div class="topic-meta">
                            <span class="author">
                                <el-avatar
                                    shape="square"
                                    :size="25"
                                    :src="getUserInfo(topic.uid, 'avatar')"
                                />
                                {{ getUserInfo(topic.uid, 'nickname') }}
                            </span>
                            <span class="divider">•</span>
                            <span class="date">
                                <ElIcon><Clock /></ElIcon>
                                {{ topic.publishTime }}
                            </span>
                            <span class="divider">•</span>
                            <span class="views">
                                <ElIcon><View /></ElIcon>
                                {{ topic.views }} 浏览
                            </span>
                            <span class="divider">•</span>
                            <span class="replies">
                                <ElIcon><ChatDotRound /></ElIcon>
                                {{ topic.replies }} 回复
                            </span>
                            <span v-if="topic.routerId" class="divider">•</span>
                            <ElTag v-if="topic.routerId" size="small" type="info" @click="viewRoute">
                                <ElIcon><Position /></ElIcon>
                                路线ID: {{ topic.routerId }}
                            </ElTag>
                        </div>
                    </div>
                    <div class="topic-actions-bar">
                        <ElButton
                            type="danger"
                            :icon="topic.isLiked ? 'StarFilled' : 'Star'"
                            @click="toggleLike"
                            plain
                        >
                            {{ topic.likes }}
                        </ElButton>
                    </div>
                </div>

                <div class="topic-body markdown" v-html="topicContentHtml"></div>

                <div class="topic-footer">
                    <div class="topic-stats">
                        <span><ElIcon><View /></ElIcon> {{ topic.views }} 浏览</span>
                        <span><ElIcon><ChatDotRound /></ElIcon> {{ topic.replies }} 回复</span>
                        <span><ElIcon><Star /></ElIcon> {{ topic.likes }} 点赞</span>
                    </div>
                </div>
            </div>

            <!-- 评论区域 -->
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
                            <ElButton type="primary" @click="submitComment" icon="Promotion">发表评论</ElButton>
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
        </div>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia";
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {marked} from "marked";
import FooterPagination from "@/layout/FooterPagination.vue";
import Toolbar from "@/layout/Toolbar.vue";
import forumApi from "@/api/forumApi.ts";
import userApi from "@/api/userApi.ts";

const store = useProjectStore()
const route = useRoute()
const router = useRouter()

const topicId = computed(() => Number(route.query.topicId) || 1)

// 主题数据
const topic = ref({})
// 评论数据
const comments = ref([])
// 用户信息缓存
const userCache = ref({})

onMounted(() => {
    // 获取论坛数据, 这里的luntanId暂时写死
    forumApi.forumDetail(1).then(res => {
        topic.value = res.data.luntan
        comments.value = res.data.comments

        // 预加载主题作者的信息
        loadUserInfo(topic.value.uid)

        // 预加载评论作者的信息
        comments.value.forEach(item => {
            loadUserInfo(item.comment.uid)
            item.replies.forEach(reply => {
              loadUserInfo(reply.uid)
            })
        })
    })
})

// 加载用户信息并缓存
const loadUserInfo = async (uid) => {
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
const getUserInfo = (uid, which) => {
  if (userCache.value[uid]) {
    return which === 'avatar' ? userCache.value[uid].avatar : userCache.value[uid].nickname
  }
  // 如果还没有加载完成，返回默认值
  return which === 'avatar' ? '' : '加载中...'
}

const newComment = ref('')
const commentPager = ref({
    pageSize: 20,
    pageNo: 1,
    total: 0
})

onMounted(() => {
    commentPager.value.total = comments.value.length
})

const topicContentHtml = computed(() => {
    return marked.parse(topic.value.content || '')
})

function commentContentHtml(content: string) {
    return marked.parse(content || '')
}

function getCategoryType(category: number) {
    const map: Record<number, string> = {
        1: 'primary',   // 路线讨论
        2: 'success',   // 经验分享
        3: 'warning',   // 问题求助
        4: 'info'       // 其他
    }
    return map[category] || 'info'
}

function getCategoryName(category: number) {
    const map: Record<number, string> = {
        1: '路线讨论',
        2: '经验分享',
        3: '问题求助',
        4: '其他'
    }
    return map[category] || '其他'
}

function goBack() {
    router.push({ name: 'ForumList' })
}

function toggleLike() {
    topic.value.isLiked = !topic.value.isLiked
    topic.value.likes += topic.value.isLiked ? 1 : -1
    ElMessage.success(topic.value.isLiked ? '已点赞' : '已取消点赞')
}

function toggleTop() {
    topic.value.isTop = topic.value.isTop === 1 ? 0 : 1
    ElMessage.success(topic.value.isTop === 1 ? '已置顶' : '已取消置顶')
}

function deleteTopic() {
    ElMessageBox.confirm(`删除主题 "${topic.value.title}"`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功！(静态演示)')
        router.push({ name: 'ForumList' })
    })
}

function viewRoute() {
    if (topic.value.routerId) {
        // 可以跳转到路线详情页面
        ElMessage.info('跳转到路线详情 (静态演示)')
    }
}

function submitComment() {
    if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }

    // 静态演示
    const comment = {
        commentId: Date.now(),
        luntanId: topic.value.luntanId,
        content: newComment.value,
        uid: store.authorization?.uid || 999,
        parentId: 0, // 0-一级评论
        commentTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        author: store.authorization?.nickname || '当前用户', // 需要从uid关联获取或后端返回
        replies: []
    }

    comments.value.push(comment)
    commentPager.value.total = comments.value.length
    topic.value.replies = comments.value.length
    newComment.value = ''
    ElMessage.success('评论发表成功！(静态演示)')
}

function clearComment() {
    newComment.value = ''
}

function replyToComment(comment: any) {
    // 简单的回复功能，实际可以实现更复杂的回复UI
    const replyContent = prompt(`回复 ${comment.author}:`)
    if (replyContent && replyContent.trim()) {
        const reply = {
            commentId: Date.now(),
            luntanId: topic.value.luntanId,
            content: replyContent,
            uid: store.authorization?.uid || 999,
            parentId: comment.commentId, // 回复的父评论id
            commentTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
            author: store.authorization?.nickname || '当前用户' // 需要从uid关联获取或后端返回
        }

        if (!comment.replies) {
            comment.replies = []
        }
        comment.replies.push(reply)
        topic.value.replies++
        ElMessage.success('回复成功！(静态演示)')
    }
}

function deleteComment(comment: any) {
    ElMessageBox.confirm('确认删除这条评论？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const index = comments.value.findIndex(c => c.commentId === comment.commentId)
        if (index > -1) {
            comments.value.splice(index, 1)
            commentPager.value.total = comments.value.length
            topic.value.replies = comments.value.length
            ElMessage.success('删除成功！(静态演示)')
        }
    })
}

function deleteReply(reply: any) {
    ElMessageBox.confirm('确认删除这条回复？', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        comments.value.forEach(comment => {
            if (comment.replies) {
                const index = comment.replies.findIndex((r: any) => r.commentId === reply.commentId)
                if (index > -1) {
                    comment.replies.splice(index, 1)
                    topic.value.replies--
                    ElMessage.success('删除成功！(静态演示)')
                }
            }
        })
    })
}

function pageChange() {
    // 分页处理
}
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.detail-content {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.topic-card {
    background: white;
    border-radius: 8px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.topic-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid $border-normal;
}

.topic-title-section {
    flex: 1;
}

.topic-title {
    font-size: 24px;
    font-weight: 600;
    color: $text-main;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1.4;
}

.topic-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: $text-subtitle;
    flex-wrap: wrap;

    span {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .divider {
        margin: 0 5px;
    }
}

.topic-actions-bar {
    display: flex;
    gap: 10px;
}

.topic-body {
    margin: 20px 0;
    padding: 20px 0;
    line-height: 1.8;
    color: $text-main;
    border-top: 1px solid $border-normal;
    border-bottom: 1px solid $border-normal;
}

.topic-footer {
    margin-top: 20px;
    padding-top: 15px;

    .topic-stats {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: $text-subtitle;

        span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
    }
}

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

.topic-actions {
    display: flex;
    gap: 10px;
}
</style>
