<template>
  <div class="image-publish-container">
    <div class="card publish-panel">
      <div class="panel-header">
        <h2>发布图片</h2>
      </div>

      <ElForm
        ref="refFormPublish"
        :model="formPublish"
        :rules="formPublishRules"
        label-width="80px"
        size="default"
        class="publish-form"
      >
        <ElFormItem label="标题" prop="title">
          <ElInput
            v-model="formPublish.title"
            placeholder="请输入图片标题"
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="图片" prop="imageFile">
          <div class="upload-area">
            <ElUpload
              ref="uploadRef"
              class="image-uploader"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
              accept="image/*"
              drag
            >
              <div v-if="!imagePreview" class="upload-placeholder">
                <i class="el-icon-plus upload-icon"></i>
                <div class="upload-text">
                  <p>点击或拖拽图片到此处上传</p>
                  <p class="upload-hint">支持 JPG、PNG、GIF 格式，大小不超过 10MB</p>
                </div>
              </div>
              <div v-else class="image-preview">
                <img :src="imagePreview" alt="预览图片" />
                <div class="preview-mask">
                  <ElButton
                    type="danger"
                    size="small"
                    @click.stop="removeImage"
                    icon="Delete"
                  >
                    删除
                  </ElButton>
                </div>
              </div>
            </ElUpload>
          </div>
        </ElFormItem>

        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="formPublish.description"
            type="textarea"
            placeholder="请输入图片描述（选填）"
            :rows="4"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem label="标签" prop="tags">
          <div class="tags-input">
            <ElTag
              v-for="tag in formPublish.tags"
              :key="tag"
              closable
              @close="handleRemoveTag(tag)"
              class="tag-item"
            >
              {{ tag }}
            </ElTag>
            <ElInput
              v-if="tagInputVisible"
              ref="tagInputRef"
              v-model="tagInputValue"
              class="tag-input"
              size="small"
              @keyup.enter="handleAddTag"
              @blur="handleAddTag"
              placeholder="输入标签"
            />
            <ElButton
              v-else
              size="small"
              @click="showTagInput"
              icon="Plus"
            >
              添加标签
            </ElButton>
          </div>
        </ElFormItem>

        <ElFormItem label="是否公开" prop="isPublic">
          <ElRadio :label="1" v-model="formPublish.isPublic">公开</ElRadio>
          <ElRadio :label="0" v-model="formPublish.isPublic">私有</ElRadio>
        </ElFormItem>

        <ElFormItem label="位置" prop="location">
          <ElInput
            v-model="formPublish.location"
            placeholder="请输入拍摄地点（选填）"
          />
        </ElFormItem>

        <ElFormItem>
          <div class="form-actions">
            <ElButton
              v-if="getAuthorization()"
              type="primary"
              @click="handleSubmit"
              :loading="isSubmitting"
              icon="Upload"
            >
              发布
            </ElButton>
            <ElButton
              v-else
              type="primary"
              @click="$router.push({name: 'Login'})"
              icon="User"
            >
              请先登录
            </ElButton>
            <ElButton @click="handleReset" icon="Refresh">重置</ElButton>
            <ElButton @click="handleCancel" icon="Close">取消</ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </div>

    <!-- 预览区域 -->
    <div class="card preview-panel" v-if="imagePreview">
      <div class="panel-header">
        <h3>预览效果</h3>
      </div>
      <div class="preview-content">
        <Card
          :item="previewItem"
          :onlyImage="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElNotification, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { getAuthorization } from '@/utility'
import Card from './Card.vue'
import type { ItemOption } from './imageFallInterface'

const router = useRouter()

// Form data
const formPublish = reactive({
  title: '',
  imageFile: null as File | null,
  description: '',
  tags: [] as string[],
  isPublic: 1,
  location: ''
})

// Form validation rules
const formPublishRules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入图片标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  imageFile: [
    { required: true, message: '请上传图片', trigger: 'change' }
  ]
})

// Refs
const refFormPublish = ref()
const uploadRef = ref()
const tagInputRef = ref()

// State
const imagePreview = ref<string>('')
const isSubmitting = ref(false)
const tagInputVisible = ref(false)
const tagInputValue = ref('')

// Handle image upload
const handleImageChange = (file: any) => {
  const rawFile = file.raw

  // Validate file type
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return
  }

  // Validate file size (10MB)
  const isLt10M = rawFile.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return
  }

  formPublish.imageFile = rawFile

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string
  }
  reader.readAsDataURL(rawFile)
}

// Remove image
const removeImage = () => {
  formPublish.imageFile = null
  imagePreview.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// Tag management
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const handleAddTag = () => {
  const tag = tagInputValue.value.trim()
  if (tag && !formPublish.tags.includes(tag)) {
    if (formPublish.tags.length >= 5) {
      ElMessage.warning('最多添加 5 个标签')
      return
    }
    formPublish.tags.push(tag)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const handleRemoveTag = (tag: string) => {
  const index = formPublish.tags.indexOf(tag)
  if (index > -1) {
    formPublish.tags.splice(index, 1)
  }
}

// Preview item for Card component
const previewItem = computed<ItemOption>(() => {
  return {
    id: 0,
    title: formPublish.title || '未命名',
    url: imagePreview.value,
    width: 300,
    height: 400,
    avatar: 'https://via.placeholder.com/40',
    user: '当前用户',
    views: 0
  }
})

// Form submission
const handleSubmit = async () => {
  if (!refFormPublish.value) return

  await refFormPublish.value.validate((valid: boolean) => {
    if (valid) {
      submitForm()
    } else {
      ElMessage.error('请完善表单信息')
      return false
    }
  })
}

const submitForm = async () => {
  isSubmitting.value = true

  try {
    // TODO: 调用后端接口上传图片
    // 这里预留接口对接位置
    // const formData = new FormData()
    // formData.append('title', formPublish.title)
    // formData.append('image', formPublish.imageFile!)
    // formData.append('description', formPublish.description)
    // formData.append('tags', JSON.stringify(formPublish.tags))
    // formData.append('isPublic', formPublish.isPublic.toString())
    // formData.append('location', formPublish.location)

    // const response = await imageApi.publish(formData)

    // 模拟提交成功
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElNotification({
      title: '发布成功',
      message: '您的图片已成功发布！',
      type: 'success',
      position: 'top-right'
    })

    // Reset form and redirect
    handleReset()
    // router.push({ name: 'ImageFall' })

  } catch (error) {
    ElMessage.error('发布失败，请重试')
    console.error('Submit error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
const handleReset = () => {
  refFormPublish.value?.resetFields()
  removeImage()
  formPublish.tags = []
  formPublish.description = ''
  formPublish.location = ''
}

// Cancel and go back
const handleCancel = () => {
  router.back()
}
</script>

<style scoped lang="scss">
@import "../../scss/plugin";

.image-publish-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .card {
    background: white;
    border: 1px solid #e3e8f7;
    border-radius: 10px;
    padding: 24px;
  }

  .publish-panel {
    flex: 1;
    max-width: 800px;

    .panel-header {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #e3e8f7;

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
    }

    .publish-form {
      .upload-area {
        width: 100%;

        .image-uploader {
          width: 100%;

          :deep(.el-upload) {
            width: 100%;
            border: 2px dashed #d9d9d9;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
            }
          }

          :deep(.el-upload-dragger) {
            width: 100%;
            height: auto;
            padding: 40px 20px;
            background-color: #fafafa;
            border: none;
          }
        }

        .upload-placeholder {
          text-align: center;

          .upload-icon {
            font-size: 48px;
            color: #8c939d;
            margin-bottom: 16px;
          }

          .upload-text {
            p {
              margin: 8px 0;
              color: #606266;
              font-size: 14px;
            }

            .upload-hint {
              color: #909399;
              font-size: 12px;
            }
          }
        }

        .image-preview {
          position: relative;
          width: 100%;
          max-height: 400px;
          overflow: hidden;
          border-radius: 8px;

          img {
            width: 100%;
            height: auto;
            display: block;
          }

          .preview-mask {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;

            &:hover {
              opacity: 1;
            }
          }
        }
      }

      .tags-input {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;

        .tag-item {
          margin: 0;
        }

        .tag-input {
          width: 120px;
        }
      }

      .form-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .preview-panel {
    flex-shrink: 0;
    width: 400px;
    height: fit-content;
    position: sticky;
    top: 20px;

    .panel-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e3e8f7;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
    }

    .preview-content {
      width: 100%;
    }
  }
}

@media (max-width: 1200px) {
  .image-publish-container {
    flex-direction: column;

    .preview-panel {
      width: 100%;
      position: relative;
      top: 0;
    }
  }
}

@media (max-width: 768px) {
  .image-publish-container {
    padding: 12px;

    .card {
      padding: 16px;
    }

    .publish-panel .panel-header h2 {
      font-size: 20px;
    }

    .form-actions {
      flex-direction: column;

      button {
        width: 100%;
      }
    }
  }
}
</style>
