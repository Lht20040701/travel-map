<template>
  <div class="ai-chat-page">
    <!-- 页面头部 -->
    <div class="ai-chat-header">
      <div class="header-content">
        <div class="ai-avatar">
          <el-icon size="24"><ChatDotRound /></el-icon>
        </div>
        <div class="ai-info">
          <h1>AI助手</h1>
          <p>智能问答，帮助您更好地使用地图功能</p>
        </div>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="ai-chat-container">
      <!-- 聊天消息区域 -->
      <div class="ai-chat-messages" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id"
          class="message-item"
          :class="message.type === 'user' ? 'user-message' : 'ai-message'"
          :data-message-type="message.type"
          :data-message-id="message.id"
        >
          <div class="message-avatar" v-if="message.type === 'ai'">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <div class="message-text" v-html="formatMessage(message.content, message.type)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              <!-- 流式渲染时的⚫符号 -->
              <span v-if="message.type === 'ai' && isTyping && message.id === getCurrentTypingMessageId()" class="typing-dot">⚫</span>
            </div>
          </div>
          <div class="message-avatar user-avatar" v-if="message.type === 'user'">
            <el-icon><User /></el-icon>
          </div>
        </div>
        
        <!-- 加载指示器 -->
        <div v-if="isTyping" class="message-item ai-message">
          <div class="message-avatar">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="message-content">
            <div class="message-bubble typing-indicator">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="ai-chat-input">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 2, maxRows: 6 }"
            placeholder="输入您的问题，我会尽力为您解答..."
            @keydown.enter.prevent="handleSendMessage"
            :disabled="isTyping"
            ref="messageInput"
            class="message-input"
          />
          <div class="input-actions">
            <div class="action-left">
              <el-button 
                type="text" 
                size="small" 
                @click="clearChat"
                icon="Delete"
                class="action-btn"
              >
                清空对话
              </el-button>
              <el-switch
                v-model="useStream"
                active-text="流式"
                inactive-text="普通"
                size="small"
                class="stream-switch"
              />
            </div>
            <el-button 
              type="primary" 
              @click="handleSendMessage"
              :disabled="!inputMessage.trim() || isTyping"
              :loading="isTyping"
              class="send-button"
              icon="Position"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能提示区域 -->
    <div class="ai-features">
      <div class="features-title">我可以帮您：</div>
      <div class="features-grid">
        <div class="feature-item" @click="sendQuickMessage('如何使用地图功能？')">
          <el-icon><Location /></el-icon>
          <span>地图使用指南</span>
        </div>
        <div class="feature-item" @click="sendQuickMessage('如何规划路线？')">
          <el-icon><Guide /></el-icon>
          <span>路线规划帮助</span>
        </div>
        <div class="feature-item" @click="sendQuickMessage('如何标记地点？')">
          <el-icon><LocationFilled /></el-icon>
          <span>地点标记说明</span>
        </div>
        <div class="feature-item" @click="sendQuickMessage('如何查看GPX文件？')">
          <el-icon><Document /></el-icon>
          <span>GPX文件查看</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { AIService } from '@/api/aiApi'
import { marked } from 'marked'

// 配置marked选项
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 支持GitHub风格的markdown
})

// 消息接口
interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  reasoning?: string // AI推理过程
}

// 响应式数据
const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()
const messageInput = ref()
const useStream = ref(true) // 默认使用流式响应
const currentTypingMessageId = ref<string | null>(null) // 当前正在输入的消息ID

// 初始化欢迎消息
onMounted(() => {
  addMessage('ai', '您好！我是您的AI助手，有什么可以帮助您的吗？')
})

// 添加消息
const addMessage = (type: 'user' | 'ai', content: string, reasoning?: string) => {
  const message: ChatMessage = {
    id: Date.now().toString(),
    type,
    content,
    timestamp: new Date(),
    reasoning
  }
  messages.value.push(message)
  scrollToBottom()
}

// 发送消息
const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || isTyping.value) return
  
  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 添加用户消息
  addMessage('user', userMessage)
  
  // 设置AI正在输入状态
  isTyping.value = true
  
  try {
    if (useStream.value) {
      // 使用流式响应
      await handleStreamResponse(userMessage)
    } else {
      // 使用普通响应
      await handleNormalResponse(userMessage)
    }
  } catch (error) {
    ElMessage.error('发送消息失败，请重试')
    console.error('AI回复错误:', error)
  } finally {
    isTyping.value = false
  }
}

// 处理普通响应
const handleNormalResponse = async (userMessage: string): Promise<void> => {
  try {
    const response = await AIService.sendMessage(userMessage, false)
    
    if (response.success && response.data) {
      const aiResponse = response.data as any
      addMessage('ai', aiResponse.content, aiResponse.reasoning)
    } else {
      throw new Error(response.message || 'AI回复失败')
    }
  } catch (error) {
    console.error('AI普通响应错误:', error)
    addMessage('ai', '抱歉，我暂时无法回复您的消息，请稍后再试。')
  }
}

// 处理流式响应
const handleStreamResponse = async (userMessage: string): Promise<void> => {
  let aiMessageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // 确保唯一ID
  let aiContent = '' // 用于累积AI回复内容
  let isFirstLine = true // 标记是否为第一行
  let firstLineContent = '' // 存储第一行内容
  
  // 先添加一个空的AI消息
  const aiMessage: ChatMessage = {
    id: aiMessageId,
    type: 'ai',
    content: '',
    timestamp: new Date(),
    reasoning: ''
  }
  messages.value.push(aiMessage)
  currentTypingMessageId.value = aiMessageId // 设置当前正在输入的消息ID
  console.log('创建AI消息:', aiMessage) // 调试信息
  
  try {
    await AIService.sendStreamMessage(
      userMessage,
      // onMessage 回调
      (content: string) => {
        // 处理第一行（思考内容）
        if (isFirstLine) {
          firstLineContent = content.trim()
          isFirstLine = false
          // 将第一行格式化为引用风格
          aiContent = `> ${firstLineContent}\n\n`
        } else {
          // 累积后续内容
          aiContent += content
        }
        
        // 更新AI消息内容 - 使用更安全的方式
        const messageIndex = messages.value.findIndex(msg => msg.id === aiMessageId)
        if (messageIndex !== -1) {
          // 确保消息类型不被改变
          const currentMessage = messages.value[messageIndex]
          if (currentMessage.type === 'ai') {
            messages.value[messageIndex] = {
              ...currentMessage,
              content: aiContent // 这里aiContent已经包含了正确的换行符和引用格式
            }
            console.log('更新AI消息内容:', messages.value[messageIndex]) // 调试信息
            scrollToBottom()
          } else {
            console.error('消息类型被意外改变:', currentMessage)
          }
        }
      },
      // onError 回调
      (error: any) => {
        console.error('AI流式响应错误:', error)
        const messageIndex = messages.value.findIndex(msg => msg.id === aiMessageId)
        if (messageIndex !== -1) {
          const currentMessage = messages.value[messageIndex]
          messages.value[messageIndex] = {
            ...currentMessage,
            content: '抱歉，我暂时无法回复您的消息，请稍后再试。'
          }
        }
      },
      // onComplete 回调
      () => {
        console.log('AI流式响应完成')
        currentTypingMessageId.value = null // 清除当前正在输入的消息ID
      }
    )
  } catch (error) {
    console.error('AI流式响应错误:', error)
    const messageIndex = messages.value.findIndex(msg => msg.id === aiMessageId)
    if (messageIndex !== -1) {
      const currentMessage = messages.value[messageIndex]
      messages.value[messageIndex] = {
        ...currentMessage,
        content: '抱歉，我暂时无法回复您的消息，请稍后再试。'
      }
    }
  }
}

// 清空聊天记录
const clearChat = () => {
  messages.value = []
  addMessage('ai', '聊天记录已清空。有什么可以帮助您的吗？')
}

// 发送快速消息
const sendQuickMessage = (message: string) => {
  inputMessage.value = message
  handleSendMessage()
}

// 格式化消息内容（支持markdown渲染）
const formatMessage = (content: string, type: 'user' | 'ai' = 'user') => {
  if (type === 'ai') {
    // AI消息支持markdown渲染
    return marked(content)
  } else {
    // 用户消息只支持换行
    return content.replace(/\n/g, '<br>')
  }
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 获取当前正在输入的消息ID
const getCurrentTypingMessageId = () => {
  return currentTypingMessageId.value
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 移除不需要的事件定义
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.ai-chat-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $bg-light;
}

.ai-chat-header {
  background-color: white;
  border-bottom: 1px solid $border-normal;
  padding: 20px 30px;
  
  .header-content {
    display: flex;
    align-items: center;
    
    .ai-avatar {
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
    
    .ai-info {
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

.ai-chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
}

.ai-chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: white;
  @include border-radius($radius);
  @include box-shadow(1px 1px 3px rgba(0, 0, 0, 0.1));
  margin-bottom: 20px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: $border-normal;
    @include border-radius(3px);
  }
  
  &:hover::-webkit-scrollbar-thumb {
    background-color: $color-main;
  }
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  
  &.user-message {
    flex-direction: row-reverse;
    
    .message-content {
      align-items: flex-end;
    }
    
    .message-bubble {
      background-color: $color-main;
      color: white;
    }
  }
  
  &.ai-message {
    flex-direction: row; // 明确设置AI消息在左侧
    
    .message-bubble {
      background-color: $bg-light;
      color: $text-main;
      border: 1px solid $border-normal;
    }
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  @include border-radius(50%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 12px;
  flex-shrink: 0;
  font-size: 16px;
  
  &.user-avatar {
    background-color: $color-main;
    color: white;
  }
  
  &:not(.user-avatar) {
    background-color: $border-light;
    color: $text-description;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  @include border-radius($radius);
  word-wrap: break-word;
  position: relative;
  font-size: $fz-normal;
  line-height: 1.5;
  
  .message-text {
    margin-bottom: 6px;
    
    // Markdown样式支持
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin: 8px 0 4px 0;
      font-weight: bold;
      line-height: 1.3;
    }
    
    :deep(h1) { font-size: 1.2em; }
    :deep(h2) { font-size: 1.1em; }
    :deep(h3) { font-size: 1.05em; }
    
    :deep(p) {
      margin: 4px 0;
      line-height: 1.5;
    }
    
    :deep(strong), :deep(b) {
      font-weight: bold;
    }
    
    :deep(em), :deep(i) {
      font-style: italic;
    }
    
    :deep(code) {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    :deep(pre) {
      background-color: rgba(0, 0, 0, 0.05);
      padding: 8px 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
      
      code {
        background-color: transparent;
        padding: 0;
      }
    }
    
    :deep(ul), :deep(ol) {
      margin: 4px 0;
      padding-left: 20px;
    }
    
    :deep(li) {
      margin: 2px 0;
    }
    
    :deep(blockquote) {
      border-left: 3px solid $color-main;
      padding-left: 12px;
      margin: 8px 0;
      color: $text-description;
      font-style: italic;
    }
    
    :deep(a) {
      color: $color-main;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    :deep(table) {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
    }
    
    :deep(th), :deep(td) {
      border: 1px solid $border-normal;
      padding: 6px 8px;
      text-align: left;
    }
    
    :deep(th) {
      background-color: $bg-light;
      font-weight: bold;
    }
  }
  
  .message-time {
    font-size: $fz-small;
    opacity: 0.7;
    text-align: right;
  }
  
  .typing-dot {
    display: inline-block;
    margin-left: 4px;
    color: $color-main;
    animation: blink 1s infinite;
    font-size: 14px;
  }
}

.typing-indicator {
  padding: 16px 20px;
  
  .typing-dots {
    display: flex;
    gap: 4px;
    
    span {
      width: 8px;
      height: 8px;
      @include border-radius(50%);
      background-color: $text-subtitle;
      animation: typing 1.4s infinite ease-in-out;
      
      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
      &:nth-child(3) { animation-delay: 0s; }
    }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.ai-chat-input {
  background-color: white;
  @include border-radius($radius);
  @include box-shadow(1px 1px 3px rgba(0, 0, 0, 0.1));
  padding: 20px;
  
  .input-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .message-input {
      :deep(.el-textarea__inner) {
        font-size: $fz-normal;
        border-color: $border-normal;
        @include border-radius($radius);
        line-height: 1.5;
        
        &:focus {
          border-color: $color-main;
        }
      }
    }
    
    .input-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .action-left {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .action-btn {
          color: $text-description;
          font-size: $fz-small;
          
          &:hover {
            color: $color-main;
          }
        }
        
        .stream-switch {
          :deep(.el-switch__label) {
            font-size: $fz-small;
            color: $text-description;
          }
          
          :deep(.el-switch__label.is-active) {
            color: $color-main;
          }
        }
      }
      
      .send-button {
        background-color: $color-main;
        border-color: $color-main;
        
        &:hover {
          background-color: darken($color-main, 10%);
          border-color: darken($color-main, 10%);
        }
      }
    }
  }
}

.ai-features {
  background-color: white;
  @include border-radius($radius);
  @include box-shadow(1px 1px 3px rgba(0, 0, 0, 0.1));
  padding: 20px;
  margin-top: 20px;
  
  .features-title {
    font-size: $fz-title;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 16px;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    
    .feature-item {
      @extend .btn-like;
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background-color: $bg-light;
      @include border-radius($radius);
      border: 1px solid $border-normal;
      cursor: pointer;
      @include transition(all 0.3s ease);
      
      &:hover {
        background-color: $bg-active;
        border-color: $color-main;
        color: $color-main;
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 18px;
      }
      
      span {
        font-size: $fz-normal;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ai-chat-header {
    padding: 15px 20px;
    
    .header-content {
      .ai-avatar {
        width: 40px;
        height: 40px;
        margin-right: 15px;
      }
      
      .ai-info h1 {
        font-size: 20px;
      }
    }
  }
  
  .ai-chat-container {
    padding: 15px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
