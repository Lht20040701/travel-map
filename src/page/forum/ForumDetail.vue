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
                        {{ topic.isTop === true ? '取消置顶' : '置顶' }}
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
            <ForumComments
                :comments="comments"
                :luntan-id="topic.luntanId"
                @update:comments="comments = $event"
                @comment-count-change="topic.replies = $event"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia";
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {marked} from "marked";
import Toolbar from "@/layout/Toolbar.vue";
import forumApi from "@/api/forumApi.ts";
import userApi from "@/api/userApi.ts";
import ForumComments from "./ForumComments.vue";

const store = useProjectStore()
const route = useRoute()
const router = useRouter()

const luntanId = computed(() => Number(route.query.luntanId) || 1)

// 主题数据
const topic = ref({})
// 评论数据
const comments = ref([])
// 用户信息缓存
const userCache = ref({})

onMounted(() => {
    // 获取论坛数据, 这里的luntanId暂时写死
    forumApi.forumDetail(luntanId.value).then(res => {
        topic.value = res.data.luntan
        comments.value = res.data.comments

        // 预加载主题作者的信息
        loadUserInfo(topic.value.uid)
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


const topicContentHtml = computed(() => {
    return marked.parse(topic.value.content || '')
})

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
    topic.value.isTop = !topic.value.isTop
    forumApi.toggleForumTop({
      luntanId: topic.value.luntanId,
      isTop: topic.value.isTop
    }).then(res => {
      ElMessage.success(res.message)
    })
}

function deleteTopic() {
    ElMessageBox.confirm(`删除主题 "${topic.value.title}"`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
      forumApi.deleteForum(topic.value.luntanId)
          .then(res => {
            ElMessage.success('删除成功')
            router.push({ name: 'ForumList' })
          })
    })
}

function viewRoute() {
    if (topic.value.routerId) {
        // 可以跳转到路线详情页面
        ElMessage.info('跳转到路线详情 (静态演示)')
    }
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
    //border-top: 1px solid $border-normal;
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


.topic-actions {
    display: flex;
    gap: 10px;
}
</style>
