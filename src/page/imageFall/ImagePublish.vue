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
    <div class="preview-section" :class="{ 'has-preview': imagePreview }">
      <div class="preview-header">
        <h3>
          <i class="el-icon-view"></i>
          预览效果
          <span class="preview-hint" v-if="!imagePreview">(上传图片后显示预览)</span>
        </h3>
      </div>
      <div class="preview-container">
        <transition name="fade">
          <div class="card preview-panel" v-if="imagePreview">
            <div class="preview-content">
              <Card
                :item="previewItem"
                :onlyImage="false"
              />
            </div>
          </div>
          <div v-else class="empty-preview">
            <i class="el-icon-picture-outline"></i>
            <p>预览将在此处显示</p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElNotification, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { getAuthorization } from '@/utility'
import Card from './Card.vue'
import type { ItemOption } from './imageFallInterface'
import { useProjectStore } from "@/store.ts";
import {qiniu_bucket_name, qiniu_img_base_url, thumbnail200_suffix} from "@/mapConfig.ts";
import {getUploadToken} from "@/api/fileApi.ts";
import * as qiniu from "qiniu-js";
import imageFallApi from "@/api/imageFallApi.ts";

const router = useRouter()
const store = useProjectStore()

// 表单数据
const formPublish = reactive({
  title: '',
  imageFile: null as File | null,
})

// 表单验证规则
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

// State
const imagePreview = ref<string>('')
const imageW = ref(300)
const imageH = ref(400)
const isSubmitting = ref(false)

// 图片本地上传
const handleImageChange = (file: any) => {
  // 文档说明：https://element-plus.org/zh-CN/component/upload#%E7%B1%BB%E5%9E%8B%E5%A3%B0%E6%98%8E
  // 注意rawFile调用的方法很多都是原生的File类型，File又继承了Blob类型，具体方法直接上MDN查就行了
  const rawFile = file.raw

  // 验证是否是图片类型，MIME类型参考：https://developer.mozilla.org/zh-CN/docs/Glossary/MIME_type
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return
  }

  // 验证图片大小, .size返回的是字节
  const isLt10M = rawFile.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return
  }

  formPublish.imageFile = rawFile

  // 创建预览信息
  const reader = new FileReader()
  // 设置文件读取成功后触发事件：https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/load_event
  reader.onload = (e) => {
    // console.log("result", e.target?.result)
    getImageWH(rawFile)
        .then(res => {
          imageW.value = res.width
          imageH.value = res.height
        })
        .catch(err => {
          ElMessage.error(err)
        })
    imagePreview.value = e.target?.result as string
  }
  // 读取文件：https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader/readAsDataURL
  // 读取后result是一个base64字符串
  reader.readAsDataURL(rawFile)
}

// 通用函数：传入 File/Blob，返回宽高 Promise
function getImageWH(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // 临时 URL 指向 File/Blob 二进制
    img.src = URL.createObjectURL(fileOrBlob)
    img.onload = () => {
      URL.revokeObjectURL(img.src); // 释放内存
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => reject('非有效图片或解析失败')
  })
}

// 移除图片
const removeImage = () => {
  formPublish.imageFile = null
  imagePreview.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 卡片组件的预览信息
const previewItem = computed<ItemOption>(() => {
  return {
    id: 0,
    title: formPublish.title || '未编写标题',
    url: imagePreview.value,
    width: imageW.value,
    height: imageH.value,
    avatar: store.authorization.avatar || 'http://cnd.ilovelihaotian.icu/default_avatar.png',
    user: store.authorization.nickname || '当前用户',
    views: 1000
  }
})

// 表单提交
const handleSubmit = async () => {
  // console.log(previewItem.value)
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

const submitForm = () => {
  // 能点击这个Button就说明已经是登录状态了
  isSubmitting.value = true

  // 这里后面写七牛的上传逻辑：https://developer.qiniu.com/kodo/6889/javascript-sdk-historical-document-2-x
  // 本项目已经有了七牛的上传案例

  getUploadToken({
    bucket: qiniu_bucket_name
  })
      .then(res => {
        console.log('get token success')
        // 返回一个 Promise 来处理七牛上传，等七牛上传完毕后再处理后续事情
        // 而且qiniu好像有默认的上传去重机制：https://developer.qiniu.com/kodo/kb/1365/how-to-avoid-the-users-to-upload-files-with-the-same-key
        return new Promise((resolve, reject) => {
          // 上传文件
          const observer = {
            next: res => {
              console.log('next: ',res)
            },
            error: err => {
              console.log('error: ',err)
              reject(err) // 上传失败时 reject
            },
            // 上传完成
            complete: res => {
              // 返回结果，hash和key
              // { hash: "Fi_DMzHMIK4AGB0U5P3S86-qL-7Q", key: "Fi_DMzHMIK4AGB0U5P3S86-qL-7Q" }
              console.log('complete: ',res)
              // 上传完成后的处理逻辑
              resolve(res) // 上传成功时 resolve
            }
          }

          const observable = qiniu.upload(formPublish.imageFile, null, res.data, {}, {})
          const subscription = observable.subscribe(observer) // 上传开始
        })
      })
      .then(uploadResult => {
        // 上传成功后的处理，调用后端接口上传图片

        const postData = {
          title: previewItem.value.title,
          url: qiniu_img_base_url + uploadResult.key,
          width: previewItem.value.width,
          height: previewItem.value.height,
          uid: store.authorization.uid,
          views: 0
        }

        imageFallApi.addImage(postData)
          .then(res => {
            ElNotification({
              title: '发布成功',
              message: '您的图片已成功发布！',
              type: 'success',
              position: 'top-right'
            })
          })
          .catch(err => {
            ElMessage.error('发布失败，请重试')
          })

        // 上传完成后重置，注意不要上传还没开始，就给图片清了，这样会报错
        handleReset()
        // router.push({ name: 'ImageFall' }) // 可选跳转
      })
      .catch(err => {
        console.error('上传失败：', err)
        ElMessage.error(err.message || '上传失败，请重试')
      })
      .finally(() => {
        isSubmitting.value = false
      })
}

// 重置表单
const handleReset = () => {
  refFormPublish.value?.resetFields()
  removeImage()
}

// 取消并返回
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
    }
  }

  .preview-section {
    flex-shrink: 0;
    width: 420px;
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

    .preview-content {
      width: 100%;
      transition: all 0.3s;
    }
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
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
