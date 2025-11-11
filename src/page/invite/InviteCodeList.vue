<template>
    <div class="invite-code-list">
        <Toolbar>
            <template #left>
                <h2>邀请码管理</h2>
            </template>
            <template #center>
                <div class="search-bar">
                    <ElForm inline>
                        <ElFormItem label="关键字" class="ml-4">
                            <ElInput clearable placeholder="搜索邀请码或用户ID" v-model="formSearch.keyword"></ElInput>
                        </ElFormItem>
                        <ElFormItem>
                            <ElButton type="primary" @click="search" icon="Filter">查询</ElButton>
                        </ElFormItem>
                    </ElForm>
                </div>
            </template>
            <template #right></template>
        </Toolbar>

        <ElRow :gutter="10">
            <ElCol :span="24">
                <ElTable
                    class="table-narrow"
                    size="small"
                    :height="store.contentInsets.heightContent"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <ElTableColumn width="200" prop="id" label="邀请码">
                        <template #default="scope">
                            <ElTag type="info" size="large">{{ scope.row.id }}</ElTag>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="180" align="center" prop="dateCreate" label="创建时间">
                        <template #default="scope">
                            <div v-if="scope.row.dateCreate">{{ scope.row.dateCreate }}</div>
                            <span v-else>-</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="180" align="center" prop="dateRegister" label="使用时间">
                        <template #default="scope">
                            <div v-if="scope.row.dateRegister">{{ scope.row.dateRegister }}</div>
                            <ElTag v-else type="info" size="small">未使用</ElTag>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="150" align="center" prop="bindingUid" label="使用者ID">
                        <template #default="scope">
                            <div v-if="scope.row.bindingUid">{{ scope.row.bindingUid }}</div>
                            <ElTag v-else type="warning" size="small">未绑定</ElTag>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="center" prop="status" label="状态">
                        <template #default="scope">
                            <ElTag v-if="scope.row.bindingUid" effect="dark" type="success">已使用</ElTag>
                            <ElTag v-else effect="dark" type="info">未使用</ElTag>
                        </template>
                    </ElTableColumn>
                </ElTable>

                <!--  PAGINATION  -->
                <FooterPagination
                    @pagerChange="pageChange"
                    :pager-option="pager"/>
            </ElCol>
        </ElRow>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia";
import {dateFormatter} from "@/utility";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import FooterPagination from "@/layout/FooterPagination.vue";
import Toolbar from "@/layout/Toolbar.vue";

const store = useProjectStore()
const router = useRouter()

const isLoading = ref(false)
const tableData = ref([])

// pager
const pager = ref({
    pageSize: 20,
    pageNo: 1,
    total: 0
})

const formSearch = ref({
    keyword: '',
})

// 邀请码数据接口类型
interface InviteCode {
    id: string,              // 邀请码本身（唯一标识）
    dateCreate: string,       // 创建时间
    dateRegister: string | null,  // 使用时间
    bindingUid: number | null,    // 使用者ID
}

onMounted(() => {
    // 权限检查：只有管理员才能访问
    if (!store.isAdmin) {
        ElMessage.warning('您没有权限访问此页面')
        router.push({name: 'Index'})
        return
    }
    getInviteCodeList()
})

function search() {
    pager.value.pageNo = 1
    getInviteCodeList()
}

// pagination
function pageChange() {
    getInviteCodeList()
}

// 获取邀请码列表
function getInviteCodeList() {
    isLoading.value = true
    
    // TODO: 这里先使用假数据，后续替换为真实接口
    // 模拟接口延迟
    setTimeout(() => {
        // 假数据
        const mockData: InviteCode[] = [
            {
                id: 'INVITE-2024-001',
                dateCreate: dateFormatter(new Date('2024-01-15 10:30:00'), 'yyyy/MM/dd hh:mm:ss'),
                dateRegister: dateFormatter(new Date('2024-01-20 14:25:00'), 'yyyy/MM/dd hh:mm:ss'),
                bindingUid: 1001
            },
            {
                id: 'INVITE-2024-002',
                dateCreate: dateFormatter(new Date('2024-02-10 09:15:00'), 'yyyy/MM/dd hh:mm:ss'),
                dateRegister: null,
                bindingUid: null
            },
            {
                id: 'INVITE-2024-003',
                dateCreate: dateFormatter(new Date('2024-02-18 16:45:00'), 'yyyy/MM/dd hh:mm:ss'),
                dateRegister: dateFormatter(new Date('2024-02-25 11:20:00'), 'yyyy/MM/dd hh:mm:ss'),
                bindingUid: 1003
            },
            {
                id: 'INVITE-2024-004',
                dateCreate: dateFormatter(new Date('2024-03-05 13:00:00'), 'yyyy/MM/dd hh:mm:ss'),
                dateRegister: null,
                bindingUid: null
            },
            {
                id: 'INVITE-2024-005',
                dateCreate: dateFormatter(new Date('2024-03-12 08:30:00'), 'yyyy/MM/dd hh:mm:ss'),
                dateRegister: dateFormatter(new Date('2024-03-15 15:10:00'), 'yyyy/MM/dd hh:mm:ss'),
                bindingUid: 1005
            }
        ]

        // 如果有搜索关键字，进行过滤
        let filteredData = mockData
        if (formSearch.value.keyword) {
            const keyword = formSearch.value.keyword.toLowerCase()
            filteredData = mockData.filter(item => 
                item.id.toLowerCase().includes(keyword) ||
                (item.bindingUid && item.bindingUid.toString().includes(keyword))
            )
        }

        // 分页处理
        const start = (pager.value.pageNo - 1) * pager.value.pageSize
        const end = start + pager.value.pageSize
        tableData.value = filteredData.slice(start, end)
        pager.value.total = filteredData.length

        isLoading.value = false
    }, 300) // 模拟网络延迟

    // TODO: 真实接口调用示例
    // inviteCodeApi
    //     .list({
    //         pageNo: pager.value.pageNo,
    //         pageSize: pager.value.pageSize,
    //         keyword: formSearch.value.keyword
    //     })
    //     .then(res => {
    //         isLoading.value = false
    //         pager.value = res.data.pager
    //         tableData.value = res.data.list.map(item => {
    //             item.dateCreate = dateFormatter(new Date(item.dateCreate), 'yyyy/MM/dd hh:mm:ss')
    //             if (item.dateRegister) {
    //                 item.dateRegister = dateFormatter(new Date(item.dateRegister), 'yyyy/MM/dd hh:mm:ss')
    //             }
    //             return item
    //         })
    //     })
    //     .catch(err => {
    //         isLoading.value = false
    //     })
}
</script>

<style lang="scss" scoped>
.invite-code-list {
    .search-bar {
        display: flex;
        align-items: center;
    }
}
</style>

