import { request } from './request'
import { ServerResponse } from './ServerResponse'

// AI聊天请求参数
interface ChatRequest {
  message: string
  stream?: boolean
}

// AI图片分析请求参数
interface ImageAnalysisRequest {
  imageUrl: string
  question?: string
  stream?: boolean
}

// AI响应数据
interface AIResponse {
  reasoning: string
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// AI API服务类
export class AIService {
  /**
   * 发送文本消息给AI
   * @param message 用户消息
   * @param stream 是否使用流式响应
   * @returns Promise<ServerResponse<AIResponse>>
   */
  static async sendMessage(message: string, stream: boolean = false): Promise<ServerResponse<AIResponse>> {
    const requestData: ChatRequest = {
      message,
      stream
    }
    
    return request('post', null, requestData, false, 'ai/chat')
  }

  /**
   * 发送流式文本消息给AI
   * @param message 用户消息
   * @param onMessage 接收消息的回调函数
   * @param onError 错误处理回调函数
   * @param onComplete 完成回调函数
   */
  static async sendStreamMessage(
    message: string,
    onMessage: (content: string) => void,
    onError: (error: any) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      const requestData: ChatRequest = {
        message,
        stream: true
      }

      // 获取认证信息
      const authorization = localStorage.getItem('Authorization')
      const authData = authorization ? JSON.parse(authorization) : null
      
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      if (authData) {
        headers['Diary-Token'] = authData.token
        headers['Diary-Uid'] = authData.uid
      }

      const BASE_URL = process.env.NODE_ENV === 'development' ? '/dev/' : 'http://localhost/portal/'
      
      const response = await fetch(BASE_URL + 'ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        
        // 处理接收到的数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行
        
        for (const line of lines) {
          if (line.trim()) {
            onMessage(line)
          }
        }
      }
    } catch (error) {
      onError(error)
    }
  }

  /**
   * 分析图片
   * @param imageUrl 图片URL
   * @param question 问题描述
   * @param stream 是否使用流式响应
   * @returns Promise<ServerResponse<AIResponse>>
   */
  static async analyzeImage(
    imageUrl: string, 
    question: string = '请描述这张图片', 
    stream: boolean = false
  ): Promise<ServerResponse<AIResponse>> {
    const requestData: ImageAnalysisRequest = {
      imageUrl,
      question,
      stream
    }
    
    return request('post', null, requestData, false, 'ai/image-analysis')
  }

  /**
   * 发送流式图片分析请求
   * @param imageUrl 图片URL
   * @param question 问题描述
   * @param onMessage 接收消息的回调函数
   * @param onError 错误处理回调函数
   * @param onComplete 完成回调函数
   */
  static async analyzeImageStream(
    imageUrl: string,
    question: string = '请描述这张图片',
    onMessage: (content: string) => void,
    onError: (error: any) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      const requestData: ImageAnalysisRequest = {
        imageUrl,
        question,
        stream: true
      }

      // 获取认证信息
      const authorization = localStorage.getItem('Authorization')
      const authData = authorization ? JSON.parse(authorization) : null
      
      const headers: any = {
        'Content-Type': 'application/json'
      }
      
      if (authData) {
        headers['Diary-Token'] = authData.token
        headers['Diary-Uid'] = authData.uid
      }

      const BASE_URL = process.env.NODE_ENV === 'development' ? '/dev/' : 'http://localhost/portal/'
      
      const response = await fetch(BASE_URL + 'ai/image-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        
        // 处理接收到的数据
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行
        
        for (const line of lines) {
          if (line.trim()) {
            onMessage(line)
          }
        }
      }
    } catch (error) {
      onError(error)
    }
  }
}

export type { ChatRequest, ImageAnalysisRequest, AIResponse }
