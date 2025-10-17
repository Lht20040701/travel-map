<template>
  <div class="image-analysis-page">
    <!-- 页面头部 -->
    <div class="analysis-header">
      <div class="header-content">
        <div class="analysis-avatar">
          <el-icon size="24"><Picture /></el-icon>
        </div>
        <div class="analysis-info">
          <h1>AI图片分析</h1>
          <p>上传图片或输入图片链接，让AI为您分析图片内容</p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="analysis-container">
      <!-- 图片上传/输入区域 -->
      <div class="image-input-section">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>图片输入</span>
              <el-switch
                v-model="useStream"
                active-text="流式"
                inactive-text="普通"
                size="small"
              />
            </div>
          </template>
          
          <div class="input-methods">
            <!-- URL输入方式 -->
            <div class="url-input">
              <el-input
                v-model="imageUrl"
                placeholder="请输入图片URL地址"
                clearable
                class="url-input-field"
              >
                <template #prepend>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
            </div>
            
            <!-- 文件上传方式 -->
            <div class="file-upload">
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleFileChange"
                accept="image/*"
                class="upload-dragger"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将图片拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 jpg/png/gif 格式，文件大小不超过10MB
                  </div>
                </template>
              </el-upload>
            </div>
          </div>
          
          <!-- 问题输入 -->
          <div class="question-input">
            <el-input
              v-model="question"
              type="textarea"
              :rows="2"
              placeholder="请输入您想了解的问题（可选）"
              class="question-field"
            />
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button 
              @click="clearAll"
              icon="Delete"
              class="clear-btn"
            >
              清空
            </el-button>
            <el-button 
              type="primary" 
              @click="analyzeImage"
              :disabled="!canAnalyze || isAnalyzing"
              :loading="isAnalyzing"
              icon="Search"
              class="analyze-btn"
            >
              开始分析
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 结果展示区域 -->
      <div class="result-section" v-if="analysisResult || isAnalyzing">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>分析结果</span>
              <el-button 
                v-if="analysisResult"
                @click="copyResult"
                icon="CopyDocument"
                size="small"
                type="text"
              >
                复制结果
              </el-button>
            </div>
          </template>
          
          <!-- 图片预览 -->
          <div class="image-preview" v-if="currentImageUrl">
            <img :src="currentImageUrl" alt="分析图片" class="preview-image" />
          </div>
          
          <!-- 分析结果 -->
          <div class="analysis-content">
            <div v-if="isAnalyzing && !analysisResult" class="analyzing-indicator">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>AI正在分析图片，请稍候...</span>
            </div>
            
            <div v-if="analysisResult" class="result-content">
              <div v-if="analysisResult.reasoning" class="reasoning-section">
                <h4>AI推理过程：</h4>
                <div class="reasoning-text">{{ analysisResult.reasoning }}</div>
              </div>
              
              <div class="content-section">
                <h4>分析结果：</h4>
                <div class="content-text" v-html="formatContent(analysisResult.content)"></div>
              </div>
              
              <div v-if="analysisResult.usage" class="usage-info">
                <el-divider />
                <div class="usage-stats">
                  <span>Token使用: {{ analysisResult.usage.total_tokens }}</span>
                  <span>输入: {{ analysisResult.usage.prompt_tokens }}</span>
                  <span>输出: {{ analysisResult.usage.completion_tokens }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage, ElUpload, type UploadFile } from 'element-plus'
import { AIService } from '@/api/aiApi'

// 响应式数据
const imageUrl = ref('')
const question = ref('请详细描述这张图片的内容')
const useStream = ref(true)
const isAnalyzing = ref(false)
const analysisResult = ref<any>(null)
const currentImageUrl = ref('')
const uploadRef = ref<InstanceType<typeof ElUpload>>()

// 计算属性
const canAnalyze = computed(() => {
  return imageUrl.value.trim() || currentImageUrl.value
})

// 处理文件上传
const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      currentImageUrl.value = e.target?.result as string
      imageUrl.value = '' // 清空URL输入
    }
    reader.readAsDataURL(file.raw)
  }
}

// 分析图片
const analyzeImage = async () => {
  if (!canAnalyze.value) {
    ElMessage.warning('请先输入图片URL或上传图片')
    return
  }
  
  const targetImageUrl = imageUrl.value.trim() || currentImageUrl.value
  const questionText = question.value.trim() || '请详细描述这张图片的内容'
  
  isAnalyzing.value = true
  analysisResult.value = null
  
  try {
    if (useStream.value) {
      await handleStreamAnalysis(targetImageUrl, questionText)
    } else {
      await handleNormalAnalysis(targetImageUrl, questionText)
    }
  } catch (error) {
    ElMessage.error('图片分析失败，请重试')
    console.error('图片分析错误:', error)
  } finally {
    isAnalyzing.value = false
  }
}

// 处理普通分析
const handleNormalAnalysis = async (imageUrl: string, question: string) => {
  try {
    const response = await AIService.analyzeImage(imageUrl, question, false)
    
    if (response.success && response.data) {
      analysisResult.value = response.data
    } else {
      throw new Error(response.message || '图片分析失败')
    }
  } catch (error) {
    console.error('图片普通分析错误:', error)
    analysisResult.value = {
      content: '抱歉，图片分析失败，请检查图片链接是否有效或稍后再试。',
      reasoning: '',
      usage: null
    }
  }
}

// 处理流式分析
const handleStreamAnalysis = async (imageUrl: string, question: string) => {
  let resultContent = ''
  let resultReasoning = ''
  
  analysisResult.value = {
    content: '',
    reasoning: '',
    usage: null
  }
  
  try {
    await AIService.analyzeImageStream(
      imageUrl,
      question,
      // onMessage 回调
      (content: string) => {
        resultContent += content
        analysisResult.value.content = resultContent
      },
      // onError 回调
      (error: any) => {
        console.error('图片流式分析错误:', error)
        analysisResult.value.content = '抱歉，图片分析失败，请检查图片链接是否有效或稍后再试。'
      },
      // onComplete 回调
      () => {
        console.log('图片流式分析完成')
      }
    )
  } catch (error) {
    console.error('图片流式分析错误:', error)
    analysisResult.value.content = '抱歉，图片分析失败，请检查图片链接是否有效或稍后再试。'
  }
}

// 清空所有内容
const clearAll = () => {
  imageUrl.value = ''
  question.value = '请详细描述这张图片的内容'
  analysisResult.value = null
  currentImageUrl.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 复制结果
const copyResult = async () => {
  if (analysisResult.value) {
    const text = `${analysisResult.value.reasoning ? `推理过程：\n${analysisResult.value.reasoning}\n\n` : ''}分析结果：\n${analysisResult.value.content}`
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('结果已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }
}

// 格式化内容
const formatContent = (content: string) => {
  return content.replace(/\n/g, '<br>')
}
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.image-analysis-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $bg-light;
}

.analysis-header {
  background-color: white;
  border-bottom: 1px solid $border-normal;
  padding: 20px 30px;
  
  .header-content {
    display: flex;
    align-items: center;
    
    .analysis-avatar {
      width: 50px;
      height: 50px;
      background-color: $color-main;
      @include border-radius(50%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
      color: white;
    }
    
    .analysis-info {
      h1 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: bold;
        color: $text-main;
      }
      
      p {
        margin: 0;
        font-size: $fz-normal;
        color: $text-description;
      }
    }
  }
}

.analysis-container {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-card, .result-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    color: $text-main;
  }
}

.input-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
  
  .url-input {
    .url-input-field {
      :deep(.el-input__inner) {
        font-size: $fz-normal;
      }
    }
  }
  
  .file-upload {
    .upload-dragger {
      width: 100%;
      height: 120px;
      border: 2px dashed $border-normal;
      @include border-radius($radius);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      @include transition(all 0.3s ease);
      
      &:hover {
        border-color: $color-main;
        background-color: rgba($color-main, 0.05);
      }
      
      .el-icon--upload {
        font-size: 28px;
        color: $text-description;
        margin-bottom: 8px;
      }
      
      .el-upload__text {
        color: $text-description;
        font-size: $fz-normal;
        
        em {
          color: $color-main;
          font-style: normal;
        }
      }
      
      .el-upload__tip {
        font-size: $fz-small;
        color: $text-subtitle;
        margin-top: 8px;
      }
    }
  }
}

.question-input {
  margin-bottom: 20px;
  
  .question-field {
    :deep(.el-textarea__inner) {
      font-size: $fz-normal;
      line-height: 1.5;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .clear-btn {
    color: $text-description;
    
    &:hover {
      color: $color-main;
    }
  }
  
  .analyze-btn {
    background-color: $color-main;
    border-color: $color-main;
    
    &:hover {
      background-color: darken($color-main, 10%);
      border-color: darken($color-main, 10%);
    }
  }
}

.image-preview {
  margin-bottom: 20px;
  text-align: center;
  
  .preview-image {
    max-width: 100%;
    max-height: 300px;
    @include border-radius($radius);
    @include box-shadow(1px 1px 3px rgba(0, 0, 0, 0.1));
  }
}

.analysis-content {
  .analyzing-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: $text-description;
    font-size: $fz-normal;
    
    .el-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  }
  
  .result-content {
    h4 {
      margin: 0 0 12px 0;
      font-size: $fz-title;
      color: $text-main;
      font-weight: bold;
    }
    
    .reasoning-section {
      margin-bottom: 24px;
      
      .reasoning-text {
        background-color: $bg-light;
        padding: 16px;
        @include border-radius($radius);
        border-left: 4px solid $color-main;
        font-size: $fz-normal;
        line-height: 1.6;
        color: $text-main;
      }
    }
    
    .content-section {
      .content-text {
        background-color: white;
        padding: 16px;
        @include border-radius($radius);
        border: 1px solid $border-normal;
        font-size: $fz-normal;
        line-height: 1.6;
        color: $text-main;
      }
    }
    
    .usage-info {
      .usage-stats {
        display: flex;
        gap: 16px;
        font-size: $fz-small;
        color: $text-description;
        
        span {
          padding: 4px 8px;
          background-color: $bg-light;
          @include border-radius(4px);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analysis-header {
    padding: 15px 20px;
    
    .header-content {
      .analysis-avatar {
        width: 40px;
        height: 40px;
        margin-right: 15px;
      }
      
      .analysis-info h1 {
        font-size: 20px;
      }
    }
  }
  
  .analysis-container {
    padding: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
    
    .clear-btn, .analyze-btn {
      width: 100%;
    }
  }
  
  .usage-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
