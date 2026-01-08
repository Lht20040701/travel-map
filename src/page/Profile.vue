<template>
    <div class="container">
        <ElRow>
            <ElCol :span="12" :offset="(24 - 12)/2">
                <div class="content"
                     :style="`min-height: ${store.windowInsets.height}px`"
                >
                    <div class="profile-header">
                        <img src="../assets/logo.png" alt="LOGO">
                        <h2>个人信息</h2>
                    </div>

                    <div v-if="!isEditing" class="profile-display">
                        <div class="avatar-section">
                            <ElAvatar :size="100" :src="userInfo.avatar">
                                <img src="../assets/logo.png" alt="default-avatar" />
                            </ElAvatar>
                        </div>
                        <ElDescriptions :column="1" border>
                            <ElDescriptionsItem label="用户名">{{ userInfo.username }}</ElDescriptionsItem>
                            <ElDescriptionsItem label="昵称">{{ userInfo.nickname }}</ElDescriptionsItem>
                            <ElDescriptionsItem label="邮箱">{{ userInfo.email }}</ElDescriptionsItem>
                            <ElDescriptionsItem label="微信">{{ userInfo.wx || '未设置' }}</ElDescriptionsItem>
                            <ElDescriptionsItem label="手机">{{ userInfo.phone || '未设置' }}</ElDescriptionsItem>
                            <ElDescriptionsItem label="主页">
                                <a v-if="userInfo.homepage" :href="userInfo.homepage" target="_blank">{{ userInfo.homepage }}</a>
                                <span v-else>未设置</span>
                            </ElDescriptionsItem>
                            <ElDescriptionsItem label="城市">{{ userInfo.city || '未设置' }}</ElDescriptionsItem>
                            <ElDescriptionsItem label="个人简介">{{ userInfo.comment || '未设置' }}</ElDescriptionsItem>
                            <ElDescriptionsItem label="注册时间">{{ formatDate(userInfo.registerTime) }}</ElDescriptionsItem>
                        </ElDescriptions>
                        <div class="actions">
                            <ElButton type="primary" @click="startEditing">编辑资料</ElButton>
                        </div>
                    </div>

                    <div v-else class="profile-edit">
                        <div class="avatar-section">
                            <ElAvatar :size="100" :src="form.avatar">
                                <img src="../assets/logo.png" alt="default-avatar" />
                            </ElAvatar>
                            <div class="avatar-upload">
                                <ElInput v-model="form.avatar" placeholder="头像URL" autocomplete="off"/>
                            </div>
                        </div>

                        <ElForm
                            label-position="top"
                            :model="form"
                            :rules="userRules"
                            ref="refFormProfile"
                            label-width="100px">
                            <ElFormItem label="昵称" prop="nickname">
                                <ElInput autocomplete="off" v-model="form.nickname"/>
                            </ElFormItem>
                            <ElFormItem label="微信 (挪车使用)" prop="wx">
                                <ElInput autocomplete="off" v-model="form.wx"/>
                            </ElFormItem>
                            <ElFormItem label="手机 (挪车使用)" prop="phone">
                                <ElInput autocomplete="off" v-model="form.phone"/>
                            </ElFormItem>
                            <ElFormItem label="主页" prop="homepage">
                                <ElInput autocomplete="off" v-model="form.homepage"/>
                            </ElFormItem>
                            <ElFormItem label="城市" prop="city">
                                <ElInput autocomplete="off" v-model="form.city"/>
                            </ElFormItem>
                            <ElFormItem label="个人简介" prop="comment">
                                <ElInput type="textarea" :rows="3" autocomplete="off" v-model="form.comment"/>
                            </ElFormItem>
                        </ElForm>
                        <div class="actions">
                            <ElButton @click="cancelEditing">取消</ElButton>
                            <ElButton type="primary" @click="saveProfile" :loading="saving">保存</ElButton>
                        </div>
                    </div>
                </div>
            </ElCol>
        </ElRow>
    </div>
</template>

<script lang="ts" setup>
import userApi from "@/api/userApi";
import {reactive, ref, onMounted} from "vue";
import {useProjectStore} from "@/store.ts";
import {ElNotification, ElMessage} from "element-plus";
import {getAuthorization, setAuthorization} from "@/utility.ts";

const store = useProjectStore()

const refFormProfile = ref()
const isEditing = ref(false)
const saving = ref(false)

const userInfo = ref({
    uid: 0,
    username: '',
    nickname: '',
    email: '',
    wx: '',
    phone: '',
    homepage: '',
    avatar: '',
    city: '',
    comment: '',
    registerTime: ''
})

const form = ref({
    nickname: '',
    wx: '',
    phone: '',
    homepage: '',
    avatar: '',
    city: '',
    comment: ''
})

const userRules = reactive({
    nickname: {required: true, message: '请填写昵称', trigger: 'blur'},
})

function formatDate(dateString: string) {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
}

function loadUserInfo() {
    const auth = getAuthorization()
    if (auth && auth.uid) {
        userApi.getUserInfo(auth.uid)
            .then(res => {
                userInfo.value = res.data
                // Initialize form with current user info
                form.value = {
                    nickname: res.data.nickname || '',
                    wx: res.data.wx || '',
                    phone: res.data.phone || '',
                    homepage: res.data.homepage || '',
                    avatar: res.data.avatar || '',
                    city: res.data.city || '',
                    comment: res.data.comment || ''
                }
            })
            .catch(err => {
                console.error(err)
            })
    } else {
        ElMessage.error('请先登录')
    }
}

function startEditing() {
    isEditing.value = true
}

function cancelEditing() {
    isEditing.value = false
    // Reset form to current user info
    form.value = {
        nickname: userInfo.value.nickname || '',
        wx: userInfo.value.wx || '',
        phone: userInfo.value.phone || '',
        homepage: userInfo.value.homepage || '',
        avatar: userInfo.value.avatar || '',
        city: userInfo.value.city || '',
        comment: userInfo.value.comment || ''
    }
}

function saveProfile() {
    refFormProfile.value.validate(valid => {
        if (valid) {
            saving.value = true
            const auth = getAuthorization()
            const updateData = {
                uid: auth.uid,
                ...form.value
            }

            userApi.updateUserInfo(updateData)
                .then(res => {
                    ElNotification({
                        title: '成功',
                        message: '个人信息更新成功',
                        position: 'top-right',
                        type: 'success',
                    })
                    isEditing.value = false
                    // Update local storage with new avatar and nickname
                    setAuthorization(
                        form.value.nickname || auth.nickname,
                        auth.uid,
                        auth.email,
                        auth.phone,
                        form.value.avatar || auth.avatar,
                        auth.token,
                        auth.group_id,
                        form.value.city || auth.city,
                        auth.geolocation
                    )
                    loadUserInfo()
                })
                .catch(err => {
                    console.error(err)
                })
                .finally(() => {
                    saving.value = false
                })
        } else {
            return false
        }
    })
}

onMounted(() => {
    loadUserInfo()
})
</script>

<style scoped lang="scss">
@import "../scss/plugin";

.container {
    background-color: $border-normal;
}

.content {
    padding: 60px 60px;
    background-color: white;
    @include box-shadow(1px 2px 5px rgba(0,0,0,0.1))
}

.profile-header {
    margin-bottom: 30px;
    display: flex;
    justify-content: center;

    img {
        padding: 5px;
        margin-right: 20px;
        display: block;
        height: 60px;
    }

    h2 {
        color: $text-main;
        line-height: 60px;
    }
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;

    .avatar-upload {
        margin-top: 15px;
        width: 300px;
    }
}

.actions {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 15px;
}

.profile-display {
    .el-descriptions {
        margin-top: 20px;
    }
}

.profile-edit {
    .el-form {
        margin-top: 20px;
    }
}
</style>
