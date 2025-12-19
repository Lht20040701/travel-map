<template>
    <div class="forum-create">
        <Toolbar>
            <template #left>
                <ElButton @click="goBack" icon="ArrowLeft">返回列表</ElButton>
            </template>
            <template #center>
            </template>
            <template #right>
              <div class="title">发布新帖子</div>
            </template>
        </Toolbar>

        <div class="create-content">
            <div class="card form-card">
                <div class="card-header">
                    <h2>填写帖子信息</h2>
                    <p class="hint">支持 Markdown，关联路线可选填</p>
                </div>

                <ElForm
                    ref="refForm"
                    :model="formPost"
                    :rules="rules"
                    label-width="90px"
                    class="post-form"
                >
                    <ElFormItem label="标题" prop="title">
                        <ElInput
                            v-model="formPost.title"
                            placeholder="请输入帖子标题"
                            maxlength="80"
                            show-word-limit
                            clearable
                        />
                    </ElFormItem>

                    <ElFormItem label="分类" prop="category">
                        <ElSelect
                            v-model="formPost.category"
                            placeholder="请选择分类"
                            style="width: 260px"
                            clearable
                        >
                            <ElOption :value="1" label="路线讨论" />
                            <ElOption :value="2" label="经验分享" />
                            <ElOption :value="3" label="问题求助" />
                            <ElOption :value="4" label="其他" />
                        </ElSelect>
                    </ElFormItem>

                    <ElFormItem label="关联路线">
                        <ElInput
                            v-model="formPost.routerId"
                            placeholder="请输入路线ID（可选）"
                            type="number"
                            style="width: 260px"
                            clearable
                        />
                    </ElFormItem>

                    <ElFormItem label="置顶">
                        <ElSwitch v-model="formPost.isTop" />
                    </ElFormItem>

                    <ElFormItem label="内容" prop="content">
                        <ElInput
                            v-model="formPost.content"
                            type="textarea"
                            :rows="12"
                            placeholder="请输入帖子内容，支持 Markdown"
                            resize="vertical"
                            clearable
                        />
                    </ElFormItem>

                    <ElFormItem>
                        <div class="form-actions">
                            <ElButton
                                type="primary"
                                :loading="isSubmitting"
                                @click="handleSubmit"
                                icon="Upload"
                            >
                                发布
                            </ElButton>
                            <ElButton @click="handleReset" icon="Refresh">重置</ElButton>
                            <ElButton @click="goBack" icon="Close">取消</ElButton>
                        </div>
                    </ElFormItem>
                </ElForm>
            </div>

            <div class="preview-section" :class="{ 'has-preview': !!formPost.content }">
                <div class="preview-header">
                    <h3>
                        <i class="el-icon-view"></i>
                        预览效果
                        <span class="preview-hint" v-if="!formPost.content">(填写内容后显示预览，效果仅供参考)</span>
                    </h3>
                </div>
                <div class="preview-container">
                    <transition name="fade">
                        <div class="card preview-panel" v-if="formPost.content">
                            <div class="preview-body">
                                <h2 class="preview-title">
                                    <ElTag v-if="formPost.isTop" type="warning" size="small" effect="dark">置顶</ElTag>
                                    <ElTag
                                        v-if="formPost.category"
                                        :type="getCategoryType(formPost.category)"
                                        size="small"
                                    >
                                        {{ getCategoryName(formPost.category) }}
                                    </ElTag>
                                    {{ formPost.title || '未填写标题' }}
                                </h2>
                                <div class="preview-meta">
                                    <span>作者：{{ store.authorization?.nickname || '当前用户' }}</span>
                                    <span>关联路线：{{ formPost.routerId || '未关联' }}</span>
                                </div>
                                <div class="preview-content markdown" v-html="previewContent"></div>
                            </div>
                        </div>
                        <div v-else class="empty-preview">
                            <i class="el-icon-document"></i>
                            <p>帖子预览将在此处显示</p>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {reactive, ref, computed} from "vue";
import {useRouter} from "vue-router";
import {ElMessage, FormRules} from "element-plus";
import Toolbar from "@/layout/Toolbar.vue";
import {useProjectStore} from "@/pinia";
import forumApi from "@/api/forumApi.ts";
import {marked} from "marked";

const router = useRouter()
const store = useProjectStore()

const refForm = ref()
const isSubmitting = ref(false)

const formPost = reactive({
    title: '',
    category: null as number | null,
    routerId: null as number | null,
    isTop: false,
    content: ''
})

const rules = reactive<FormRules>({
    title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
        { min: 2, max: 80, message: '标题长度需在 2-80 字', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择分类', trigger: 'change' }
    ],
    content: [
        { required: true, message: '请输入内容', trigger: 'blur' },
        { min: 5, message: '内容至少 5 个字', trigger: 'blur' }
    ]
})

const previewContent = computed(() => marked.parse(formPost.content || '在此编写帖子内容...'))

function getCategoryType(category: number) {
    const map: Record<number, string> = {
        1: 'primary',
        2: 'success',
        3: 'warning',
        4: 'info'
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

function handleSubmit() {
    if (!refForm.value) return
    if (!store.authorization) {
        ElMessage.warning('请先登录后再发布帖子')
        router.push({ name: 'Login' })
        return
    }

    refForm.value.validate(async (valid: boolean) => {
        if (!valid) {
            ElMessage.error('请完善表单信息')
            return
        }
        await submitPost()
    })
}

async function submitPost() {
    isSubmitting.value = true
    const payload = {
        title: formPost.title,
        category: formPost.category,
        routerId: formPost.routerId,
        content: formPost.content,
        isTop: formPost.isTop ? 1 : 0,
        uid: store.authorization?.uid
    }

    try {
        await forumApi.addForum(payload)
        ElMessage.success('发布成功')
        router.push({ name: 'ForumList' })
    } catch (err) {
        console.error(err)
        ElMessage.error('发布失败，请稍后重试')
    } finally {
        isSubmitting.value = false
    }
}

function handleReset() {
    refForm.value?.resetFields()
    formPost.content = ''
    formPost.routerId = null
    formPost.isTop = false
}

function goBack() {
    router.push({ name: 'ForumList' })
}
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.forum-create {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.title {
    font-size: 18px;
    font-weight: 600;
    color: $text-main;
}

.card {
    background: white;
    border: 1px solid $border-normal;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
    margin-bottom: 16px;

    h2, h3 {
        margin: 0;
        color: $text-main;
    }

    .hint {
        margin-top: 6px;
        color: $text-description;
        font-size: 13px;
    }
}

.post-form {
    .form-actions {
        display: flex;
        gap: 10px;
    }
}

.create-content {
    display: flex;
    gap: 20px;
    margin-top: 20px;
}

.form-card {
    flex: 1;
    max-width: 800px;
}

.preview-section {
    flex-shrink: 0;
    width: 620px;
    position: sticky;
    top: 20px;
    background: #f8f9fc;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    border: 2px dashed #e0e3e9;
    min-height: 200px;
    display: flex;
    flex-direction: column;

    &.has-preview {
        border-color: #d9ecff;
        background: #f0f7ff;
    }

    .preview-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e4e7ed;

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            color: #409EFF;
            display: flex;
            align-items: center;
            gap: 8px;

            .preview-hint {
                font-size: 12px;
                color: #909399;
                font-weight: normal;
                margin-left: 8px;
            }
        }
    }

    .preview-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 150px;
    }

    .empty-preview {
        text-align: center;
        color: #c0c4cc;
        padding: 30px 0;
        width: 100%;

        i {
            font-size: 48px;
            margin-bottom: 12px;
            display: block;
        }

        p {
            margin: 8px 0 0;
            font-size: 14px;
        }
    }
}

.preview-panel {
    width: 100%;
    height: auto;
    margin: 0;
    padding: 0;
    border: 1px solid #e4e7ed;
    transition: all 0.3s;

    &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .preview-body {
        padding: 10px 16px 16px;
    }
}

.preview-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    color: $text-main;
    margin-bottom: 10px;
}

.preview-meta {
    font-size: 13px;
    color: $text-subtitle;
    display: flex;
    gap: 14px;
    margin-bottom: 12px;
}

.preview-content {
    min-height: 200px;
    padding: 12px;
    border-radius: 8px;
    background: $bg-light;
    color: $text-description;
    line-height: 1.6;
}

@media (max-width: 1200px) {
    .create-content {
        flex-direction: column;
    }

    .preview-section {
        width: 100%;
        position: static;
    }
}
</style>

