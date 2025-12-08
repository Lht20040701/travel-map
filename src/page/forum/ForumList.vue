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
                                <ElOption label="路线讨论" value="route"></ElOption>
                                <ElOption label="经验分享" value="experience"></ElOption>
                                <ElOption label="问题求助" value="question"></ElOption>
                                <ElOption label="其他" value="other"></ElOption>
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
                        :key="topic.id"
                        class="topic-card hot-card"
                        @click="viewTopic(topic.id)"
                    >
                        <div class="topic-header">
                            <ElTag type="danger" size="small" effect="dark">热门</ElTag>
                            <span class="topic-title">{{ topic.title }}</span>
                        </div>
                        <div class="topic-meta">
                            <span class="author">{{ topic.author }}</span>
                            <span class="divider">•</span>
                            <span class="date">{{ topic.date }}</span>
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
                </h3>
                <ElTable
                    class="table-narrow"
                    size="small"
                    :height="store.contentInsets.heightContent"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <ElTableColumn width="60" prop="id" label="#" align="center"/>
                    <ElTableColumn min-width="300" prop="title" label="标题">
                        <template #default="scope">
                            <div class="topic-title-cell">
                                <ElTag v-if="scope.row.isTop" type="warning" size="small" effect="dark">置顶</ElTag>
                                <ElTag v-if="scope.row.category" :type="getCategoryType(scope.row.category)" size="small">
                                    {{ getCategoryName(scope.row.category) }}
                                </ElTag>
                                <span class="title-text" @click="viewTopic(scope.row.id)">{{ scope.row.title }}</span>
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
                    <ElTableColumn width="150" prop="lastReplyTime" label="最后回复" align="center">
                        <template #default="scope">
                            <div class="last-reply">
                                <div class="date">{{ scope.row.lastReplyTime }}</div>
                                <div class="user" v-if="scope.row.lastReplyUser">{{ scope.row.lastReplyUser }}</div>
                            </div>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="180" prop="date" label="发布时间" align="center"/>
                    <ElTableColumn width="120" label="操作" align="center" fixed="right">
                        <template #default="scope">
                            <ElButton
                                class="btn-narrow"
                                type="primary"
                                @click="viewTopic(scope.row.id)"
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

        <!-- 发布新帖对话框 -->
        <ElDialog
            center
            title="发布新帖"
            v-model="isShowDialogPost"
            width="60%"
            :before-close="closePostDialog">
            <ElForm
                :model="formPost"
                :rules="postRules"
                size="default"
                ref="refPostForm"
                label-width="100px">
                <ElFormItem label="标题" prop="title">
                    <ElInput v-model="formPost.title" placeholder="请输入帖子标题"/>
                </ElFormItem>
                <ElFormItem label="分类" prop="category">
                    <ElSelect v-model="formPost.category" placeholder="请选择分类">
                        <ElOption label="路线讨论" value="route"></ElOption>
                        <ElOption label="经验分享" value="experience"></ElOption>
                        <ElOption label="问题求助" value="question"></ElOption>
                        <ElOption label="其他" value="other"></ElOption>
                    </ElSelect>
                </ElFormItem>
                <ElFormItem label="关联路线">
                    <ElInput v-model="formPost.routeName" placeholder="可选：输入路线名称"/>
                </ElFormItem>
                <ElFormItem label="内容" prop="content">
                    <ElInput
                        type="textarea"
                        placeholder="支持 Markdown 格式"
                        :rows="10"
                        v-model="formPost.content"/>
                </ElFormItem>
            </ElForm>
            <template #footer class="dialog-footer">
                <ElButton @click="clearPostForm" type="warning" icon="RefreshLeft">清空</ElButton>
                <ElButton @click="closePostDialog" icon="Close">取 消</ElButton>
                <ElButton type="primary" @click="submitPost" icon="Check">发布</ElButton>
            </template>
        </ElDialog>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia";
import {computed, onMounted, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox, FormRules} from "element-plus";
import FooterPagination from "@/layout/FooterPagination.vue";
import Toolbar from "@/layout/Toolbar.vue";

const store = useProjectStore()
const router = useRouter()

const refPostForm = ref()
const isLoading = ref(false)
const tableData = ref([])
const isShowDialogPost = ref(false)

// 热门主题数据（静态数据）
const hotTopics = ref([
    {
        id: 1,
        title: "分享一条绝美的济南山区路线，适合春季骑行",
        author: "骑行者小明",
        date: "2025-01-15 10:30",
        views: 1250,
        replies: 45,
        likes: 128,
        routeName: "济南山区环线",
        content: "这条路线经过多个风景点，路况良好，非常适合春季骑行。沿途有樱花、桃花，美不胜收..."
    },
    {
        id: 2,
        title: "新手求问：首次长途骑行需要注意什么？",
        author: "新手小白",
        date: "2025-01-14 15:20",
        views: 980,
        replies: 32,
        likes: 56,
        routeName: null,
        content: "准备进行第一次长途骑行，想请教有经验的骑友，需要做哪些准备工作？装备、路线选择、注意事项..."
    }
])

// 表单数据
const formPost = ref({
    title: '',
    category: '',
    routeName: '',
    content: ''
})

const postRules = reactive<FormRules>({
    title: [{required: true, message: '请输入帖子标题', trigger: 'blur'}],
    category: [{required: true, message: '请选择分类', trigger: 'blur'}],
    content: [{required: true, message: '请输入内容', trigger: 'blur'}]
})

// 分页
const pager = ref({
    pageSize: 20,
    pageNo: 1,
    total: 0
})

const formSearch = ref({
    keyword: '',
    category: ''
})

// 表格数据（静态数据）
const initTableData = () => {
    tableData.value = [
        {
            id: 1,
            title: "分享一条绝美的济南山区路线，适合春季骑行",
            author: "骑行者小明",
            date: "2025-01-15 10:30:00",
            views: 1250,
            replies: 45,
            likes: 128,
            category: "route",
            routeName: "济南山区环线",
            lastReplyTime: "2025-01-16 09:15",
            lastReplyUser: "骑行爱好者",
            isTop: true,
            uid: 1
        },
        {
            id: 2,
            title: "新手求问：首次长途骑行需要注意什么？",
            author: "新手小白",
            date: "2025-01-14 15:20:00",
            views: 980,
            replies: 32,
            likes: 56,
            category: "question",
            routeName: null,
            lastReplyTime: "2025-01-15 20:30",
            lastReplyUser: "老骑友",
            isTop: false,
            uid: 2
        },
        {
            id: 3,
            title: "我的骑行装备清单分享",
            author: "装备达人",
            date: "2025-01-13 11:00:00",
            views: 756,
            replies: 28,
            likes: 89,
            category: "experience",
            routeName: null,
            lastReplyTime: "2025-01-14 16:45",
            lastReplyUser: "骑行者",
            isTop: false,
            uid: 3
        },
        {
            id: 4,
            title: "关于路线A的一些建议和改进",
            author: "路线规划师",
            date: "2025-01-12 14:30:00",
            views: 632,
            replies: 15,
            likes: 42,
            category: "route",
            routeName: "路线A",
            lastReplyTime: "2025-01-13 10:20",
            lastReplyUser: "路线创建者",
            isTop: false,
            uid: 4
        },
        {
            id: 5,
            title: "有没有适合夜骑的路线推荐？",
            author: "夜骑爱好者",
            date: "2025-01-11 19:45:00",
            views: 543,
            replies: 21,
            likes: 35,
            category: "question",
            routeName: null,
            lastReplyTime: "2025-01-12 08:30",
            lastReplyUser: "夜骑专家",
            isTop: false,
            uid: 5
        }
    ]
    pager.value.total = tableData.value.length
}

onMounted(() => {
    initTableData()
})

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

function search() {
    initTableData()
}

function viewTopic(id: number) {
    router.push({
        name: 'ForumDetail',
        query: { topicId: id }
    })
}

function createPost() {
    isShowDialogPost.value = true
    clearPostForm()
}

function clearPostForm() {
    formPost.value = {
        title: '',
        category: '',
        routeName: '',
        content: ''
    }
}

function closePostDialog(done?: () => void) {
    ElMessageBox.confirm('确认关闭？')
        .then(() => {
            isShowDialogPost.value = false
            if (done) done()
        })
        .catch(() => {})
}

function submitPost() {
    refPostForm.value.validate((valid: boolean) => {
        if (valid) {
            // 静态演示，不实际提交
            ElMessage.success('发布成功！(静态演示)')
            isShowDialogPost.value = false
            clearPostForm()
            initTableData()
        }
    })
}

function pageChange() {
    initTableData()
}

function deleteTopic(topic: any) {
    ElMessageBox.confirm(`删除主题 "${topic.title}"`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功！(静态演示)')
        initTableData()
    })
}
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
