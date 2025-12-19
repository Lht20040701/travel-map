<template>
    <div class="forum-list">
        <Toolbar>
            <template #left>
                <ElButton type="success" @click="createPost" icon="Plus">发布新帖</ElButton>
            </template>
            <template #center>
                <div class="search-bar">
                    <ElForm inline>
                        <ElFormItem label="关键字" class="ml-4">
                            <ElInput clearable placeholder="搜索标题、内容" v-model="formSearch.keyword"></ElInput>
                        </ElFormItem>
                        <ElFormItem label="分类">
                            <ElSelect
                                v-model="formSearch.category"
                                placeholder="全部分类"
                                clearable
                                style="min-width: 160px"
                            >
                                <ElOption label="全部" value=""></ElOption>
                                <ElOption label="路线讨论" :value="1"></ElOption>
                                <ElOption label="经验分享" :value="2"></ElOption>
                                <ElOption label="问题求助" :value="3"></ElOption>
                                <ElOption label="其他" :value="4"></ElOption>
                            </ElSelect>
                        </ElFormItem>
                        <ElFormItem>
                            <ElButton type="primary" @click="search" icon="Filter">查询</ElButton>
                        </ElFormItem>
                    </ElForm>
                </div>
            </template>
            <template #right></template>
        </Toolbar>

        <div class="forum-content">
            <!-- 热门主题 -->
            <div class="hot-topics" v-if="hotTopics.length > 0">
                <h3 class="section-title">
                    <ElIcon><Star /></ElIcon>
                    热门讨论
                </h3>
                <div class="topic-cards">
                    <div
                        v-for="topic in hotTopics"
                        :key="topic.luntanId"
                        class="topic-card hot-card"
                        @click="viewTopic(topic.luntanId)"
                    >
                        <div class="topic-header">
                            <ElTag type="danger" size="small" effect="dark">热门</ElTag>
                            <span class="topic-title">{{ topic.title }}</span>
                        </div>
                        <div class="topic-meta">
                            <span class="author">{{ topic.author }}</span>
                            <span class="divider">•</span>
                            <span class="date">{{ topic.publishTime }}</span>
                            <span class="divider">•</span>
                            <span class="views">{{ topic.views }} 浏览</span>
                        </div>
                        <div class="topic-content">{{ topic.content }}</div>
                        <div class="topic-footer">
                            <div class="topic-stats">
                                <span><ElIcon><ChatDotRound /></ElIcon> {{ topic.replies }}</span>
                                <span><ElIcon><Star /></ElIcon> {{ topic.likes }}</span>
                            </div>
                            <ElTag v-if="topic.routeName" size="small" type="info">路线: {{ topic.routeName }}</ElTag>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 主题列表 -->
            <div class="topics-section">
                <h3 class="section-title">
                    <ElIcon><List /></ElIcon>
                    全部主题
                  <el-dropdown>
                    <el-button type="success">
                      {{ rankRule.label }}
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="rankRule.rankTag = 0; rankRule.label = '默认'">默认</el-dropdown-item>
                        <el-dropdown-item @click="rankRule.rankTag = 1; rankRule.label = '按浏览量'">按浏览量</el-dropdown-item>
                        <el-dropdown-item @click="rankRule.rankTag = 2; rankRule.label = '按点赞数'">按点赞数</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </h3>
                <ElTable
                    class="table-narrow"
                    size="small"
                    :height="store.contentInsets.heightContent"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <ElTableColumn width="60" prop="luntanId" label="#" align="center"/>
                    <ElTableColumn min-width="300" prop="title" label="标题">
                        <template #default="scope">
                            <div class="topic-title-cell">
                                <ElTag v-if="scope.row.isTop" type="warning" size="small" effect="dark">置顶</ElTag>
                                <ElTag v-if="scope.row.category" :type="getCategoryType(scope.row.category)" size="small">
                                    {{ getCategoryName(scope.row.category) }}
                                </ElTag>
                                <span class="title-text" @click="viewTopic(scope.row.luntanId)">{{ scope.row.title }}</span>
                            </div>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="100" prop="author" label="作者" align="center"/>
                    <ElTableColumn width="120" prop="routeName" label="关联路线" align="center">
                        <template #default="scope">
                            <ElTag v-if="scope.row.routeName" size="small" type="info">{{ scope.row.routeName }}</ElTag>
                            <span v-else>-</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="80" prop="replies" label="回复" align="center">
                        <template #default="scope">
                            <span><ElIcon><ChatDotRound /></ElIcon> {{ scope.row.replies }}</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="80" prop="views" label="浏览" align="center">
                        <template #default="scope">
                            <span><ElIcon><View /></ElIcon> {{ scope.row.views }}</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="80" prop="likes" label="点赞" align="center">
                        <template #default="scope">
                            <span><ElIcon><Star /></ElIcon> {{ scope.row.likes }}</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="150" prop="lastestReply" label="最后回复" align="center">
                        <template #default="scope">
                            <div class="last-reply">
                                <div class="date" v-if="scope.row.latestReply">{{ scope.row.latestReply }}</div>
                                <div class="date" v-else>-</div>
                            </div>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="180" prop="publishTime" label="发布时间" align="center"/>
                    <ElTableColumn width="180" label="操作" align="center" fixed="right">
                        <template #default="scope">
                            <ElButton
                                class="btn-narrow"
                                type="primary"
                                @click="viewTopic(scope.row.luntanId)"
                                size="small"
                                plain
                                icon="View">查看</ElButton>
                            <ElButton
                                class="btn-narrow"
                                type="danger"
                                v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                @click="deleteTopic(scope.row)"
                                size="small"
                                plain
                                icon="Delete">删除</ElButton>
                        </template>
                    </ElTableColumn>
                </ElTable>

                <!-- 分页 -->
                <FooterPagination
                    @pagerChange="pageChange"
                    :pager-option="pager"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia";
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import FooterPagination from "@/layout/FooterPagination.vue";
import Toolbar from "@/layout/Toolbar.vue";
import forumApi from "@/api/forumApi.ts";
import userApi from "@/api/userApi.ts";
import routeApi from "@/api/routeApi.ts";

const store = useProjectStore()
const router = useRouter()

const isLoading = ref(false)
// 列表数据
const tableData = ref([])

const rankRule = ref({
  label: '默认',
  rankTag: 0
})

// 热门主题数据
const hotTopics = ref([])

// 分页
const pager = ref({
  pageNo: 1,
  pageSize: 20,
  total: 0
})

const formSearch = ref({
    keyword: '',
    category: ''
})

onMounted(() => {
    getForumList()
    getHotForumList()
})

function getCategoryType(category: number) {
    const map = {
        1: 'primary',
        2: 'success',
        3: 'warning',
        4: 'info'
    }
    return map[category] || 'info'
}

function getCategoryName(category: number) {
    const map = {
        1: '路线讨论',
        2: '经验分享',
        3: '问题求助',
        4: '其他'
    }
    return map[category] || '其他'
}

function search() {
  getForumList()
}

function viewTopic(id: number) {
    router.push({
        name: 'ForumDetail',
        query: { luntanId: id }
    })
}

function createPost() {
    router.push({ name: 'ForumCreate' })
}

function pageChange() {
  getForumList()
}

function deleteTopic(topic: any) {
    ElMessageBox.confirm(`删除主题 "${topic.title}"`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功！(静态演示)')
    })
}

function getForumList() {
  forumApi.forumList({
    keyword: formSearch.value.keyword,
    category: formSearch.value.category,
    pageNo: pager.value.pageNo,
    pageSize: pager.value.pageSize
  }).then(res => {
    new Promise(resolve => {
      if (rankRule.value.rankTag === 1) {
        res.data.list.sort((a, b) => {
          return b.views - a.views
        })
      } else if (rankRule.value.rankTag === 2) {
        res.data.list.sort((a, b) => {
          return b.likes - a.likes
        })
      }
      res.data.list.sort((a, b) => {
        return b.isTop - a.isTop
      })
      resolve()
    }).then(() => {
      tableData.value = res.data.list
      tableData.value.map(item => {
        userApi.getAvatarAndNickname(item.uid).then(_res => {
          item.author = _res.data.nickname
        })
      })
      tableData.value.map(item => {
        if (item.routerId) {
          routeApi.detail({ id: item.routerId }).then(_res => {
            item.routeName = _res.data.name
          })
        }
      })
    })
  })
}

function getHotForumList() {
  forumApi.forumList({
    keyword: formSearch.value.keyword,
    category: formSearch.value.category,
    pageNo: pager.value.pageNo,
    pageSize: pager.value.pageSize,
    isHot: true // 直接写死
  }).then(res => {
    hotTopics.value = res.data.list
    hotTopics.value.map(item => {
      userApi.getAvatarAndNickname(item.uid).then(_res => {
        item.author = _res.data.nickname
      })
    })
    hotTopics.value.map(item => {
      routeApi.detail({ id: item.routerId }).then(_res => {
        item.routeName = _res.data.name
      })
    })
  })
}

watch(rankRule.value, () => {
  getForumList()
})

</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.forum-content {
    padding: 20px;
}

.section-title {
    font-size: 18px;
    color: $text-main;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
        color: $color-main;
    }
}

.hot-topics {
    margin-bottom: 30px;

    .topic-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
    }

    .topic-card {
        background: white;
        border-radius: 8px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s;
        border: 1px solid $border-normal;

        &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        &.hot-card {
            border-left: 4px solid $red;
        }
    }

    .topic-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;

        .topic-title {
            font-size: 16px;
            font-weight: 600;
            color: $text-main;
            flex: 1;
        }
    }

    .topic-meta {
        font-size: 12px;
        color: $text-subtitle;
        margin-bottom: 10px;

        .divider {
            margin: 0 5px;
        }
    }

    .topic-content {
        font-size: 14px;
        color: $text-description;
        line-height: 1.6;
        margin-bottom: 10px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .topic-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 10px;
        border-top: 1px solid $border-normal;

        .topic-stats {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: $text-subtitle;

            span {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }
}

.topics-section {
    .topic-title-cell {
        display: flex;
        align-items: center;
        gap: 8px;

        .title-text {
            cursor: pointer;
            color: $color-primary;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .last-reply {
        font-size: 12px;

        .date {
            color: $text-subtitle;
        }

        .user {
            color: $text-description;
            margin-top: 2px;
        }
    }
}

.search-bar {
    display: flex;
    align-items: center;

    .el-select {
        min-width: 200px;
    }
}
</style>