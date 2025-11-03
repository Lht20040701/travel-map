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
                        :icon="topic.isTop ? 'Bottom' : 'Top'"
                        @click="toggleTop"
                        v-if="store.isAdmin"
                    >
                        {{ topic.isTop ? '取消置顶' : '置顶' }}
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
                            <ElTag v-if="topic.isTop" type="warning" size="small" effect="dark">置顶</ElTag>
                            <ElTag v-if="topic.category" :type="getCategoryType(topic.category)" size="small">
                                {{ getCategoryName(topic.category) }}
                            </ElTag>
                            {{ topic.title }}
                        </h1>
                        <div class="topic-meta">
                            <span class="author">
                                <ElIcon><User /></ElIcon>
                                {{ topic.author }}
                            </span>
                            <span class="divider">•</span>
                            <span class="date">
                                <ElIcon><Clock /></ElIcon>
                                {{ topic.date }}
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
                            <span v-if="topic.routeName" class="divider">•</span>
                            <ElTag v-if="topic.routeName" size="small" type="info" @click="viewRoute">
                                <ElIcon><Position /></ElIcon>
                                路线: {{ topic.routeName }}
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
                        v-for="comment in comments" 
                        :key="comment.id"
                        class="comment-item"
                    >
                        <div class="comment-avatar">
                            <ElIcon size="24"><User /></ElIcon>
                        </div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <span class="comment-author">{{ comment.author }}</span>
                                <span class="comment-date">{{ comment.date }}</span>
                                <div class="comment-actions">
                                    <ElButton 
                                        type="text" 
                                        size="small"
                                        @click="replyToComment(comment)"
                                        v-if="!comment.isReply"
                                    >
                                        回复
                                    </ElButton>
                                    <ElButton 
                                        type="danger" 
                                        size="small"
                                        text
                                        @click="deleteComment(comment)"
                                        v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === comment.uid)"
                                    >
                                        删除
                                    </ElButton>
                                </div>
                            </div>
                            <div class="comment-body markdown" v-html="commentContentHtml(comment.content)"></div>
                            
                            <!-- 回复列表 -->
                            <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
                                <div 
                                    v-for="reply in comment.replies" 
                                    :key="reply.id"
                                    class="reply-item"
                                >
                                    <div class="reply-avatar">
                                        <ElIcon size="18"><User /></ElIcon>
                                    </div>
                                    <div class="reply-content">
                                        <div class="reply-header">
                                            <span class="reply-author">{{ reply.author }}</span>
                                            <span class="reply-date">{{ reply.date }}</span>
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

const store = useProjectStore()
const route = useRoute()
const router = useRouter()

const topicId = computed(() => Number(route.query.topicId) || 1)

// 主题数据（静态）
const topic = ref({
    id: 1,
    title: "分享一条绝美的济南山区路线，适合春季骑行",
    author: "骑行者小明",
    date: "2025-01-15 10:30:00",
    views: 1250,
    replies: 45,
    likes: 128,
    category: "route",
    routeName: "济南山区环线",
    isTop: true,
    isLiked: false,
    content: `# 济南山区环线骑行分享

这条路线是我经过多次探索总结出来的，非常适合春季骑行。

## 路线概况

- **起点**: 济南市中心
- **终点**: 济南市中心
- **总里程**: 约85公里
- **预计时间**: 4-5小时
- **难度**: ⭐⭐⭐ 中等

## 路线亮点

1. **风景优美**: 沿途经过多个风景点，有樱花、桃花，美不胜收
2. **路况良好**: 大部分路段都是新修的柏油路
3. **补给方便**: 沿途有多个小镇可以休息和补给

## 注意事项

- 建议早上出发，避开中午高温
- 带好充足的饮水和食物
- 注意交通安全，佩戴头盔

希望大家都能享受这条美丽的路线！`,
    uid: 1
})

// 评论数据（静态）
const comments = ref([
    {
        id: 1,
        author: "骑行爱好者",
        date: "2025-01-15 14:20",
        content: "太棒了！我上周刚走过这条路线，确实很美！",
        uid: 2,
        replies: [
            {
                id: 11,
                author: "骑行者小明",
                date: "2025-01-15 14:35",
                content: "很高兴你也喜欢！有什么建议吗？",
                uid: 1
            }
        ]
    },
    {
        id: 2,
        author: "新手小白",
        date: "2025-01-15 16:45",
        content: "新手适合这条路线吗？需要准备什么装备？",
        uid: 3,
        replies: []
    },
    {
        id: 3,
        author: "老骑友",
        date: "2025-01-16 09:15",
        content: `这条路线我也推荐！补充几点：

1. 在XX路口有个陡坡，新手需要注意
2. 建议带个充电宝，路上可以给手机充电
3. 如果遇到雨天，部分路段会比较滑`,
        uid: 4,
        replies: []
    }
])

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

function getCategoryType(category: string) {
    const map = {
        'route': 'primary',
        'experience': 'success',
        'question': 'warning',
        'other': 'info'
    }
    return map[category] || 'info'
}

function getCategoryName(category: string) {
    const map = {
        'route': '路线讨论',
        'experience': '经验分享',
        'question': '问题求助',
        'other': '其他'
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
    topic.value.isTop = !topic.value.isTop
    ElMessage.success(topic.value.isTop ? '已置顶' : '已取消置顶')
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
    if (topic.value.routeName) {
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
        id: Date.now(),
        author: store.authorization?.nickname || '当前用户',
        date: new Date().toLocaleString('zh-CN'),
        content: newComment.value,
        uid: store.authorization?.uid || 999,
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
            id: Date.now(),
            author: store.authorization?.nickname || '当前用户',
            date: new Date().toLocaleString('zh-CN'),
            content: replyContent,
            uid: store.authorization?.uid || 999
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
        const index = comments.value.findIndex(c => c.id === comment.id)
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
                const index = comment.replies.findIndex((r: any) => r.id === reply.id)
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
