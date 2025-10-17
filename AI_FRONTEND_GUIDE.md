# 前端AI功能使用说明

## 🎉 AI功能已成功对接！

你的前端项目 `travel-map` 现在已经成功对接了豆包AI接口，包含以下功能：

### ✅ 已完成的功能：

1. **AI聊天功能** (`/ai/chat`)
   - 支持文本对话
   - 流式响应和普通响应两种模式
   - 实时显示AI回复过程
   - 清空对话功能

2. **图片分析功能** (`/ai/image-analysis`)
   - 支持URL输入和文件上传
   - 图片内容分析
   - 自定义问题提问
   - 流式响应和普通响应两种模式

### 🚀 如何使用：

#### 1. 启动后端服务
```bash
cd C:\Users\65301\Desktop\travel-map-backend-origin
npm run dev
```

#### 2. 启动前端服务
```bash
cd C:\Users\65301\Desktop\travel-map
npm run dev
```

#### 3. 配置API密钥
在后端项目根目录创建 `.env` 文件：
```bash
ARK_API_KEY=your_doubao_api_key_here
```

#### 4. 访问AI功能
- 打开浏览器访问前端应用
- 在左侧菜单中找到 "AI助手"
- 选择 "AI聊天" 或 "图片分析"

### 📋 功能详情：

#### AI聊天页面 (`/ai/chat`)
- **输入框**: 输入您的问题
- **流式/普通切换**: 选择响应模式
  - 流式：实时显示AI回复过程
  - 普通：等待完整回复后显示
- **快速问题**: 点击预设问题快速开始对话
- **清空对话**: 清除所有聊天记录

#### 图片分析页面 (`/ai/image-analysis`)
- **图片输入方式**:
  - URL输入：直接粘贴图片链接
  - 文件上传：拖拽或点击上传图片
- **问题输入**: 自定义您想了解的问题
- **分析模式**: 选择流式或普通响应
- **结果展示**: 显示AI推理过程和最终分析结果

### 🔧 技术特点：

- **用户认证**: 所有AI功能都需要用户登录
- **错误处理**: 完善的错误提示和异常处理
- **响应式设计**: 支持移动端和桌面端
- **实时交互**: 流式响应提供更好的用户体验
- **类型安全**: 完整的TypeScript类型定义

### 📝 API接口：

#### 文本对话
```typescript
// 普通响应
const response = await AIService.sendMessage(message, false)

// 流式响应
await AIService.sendStreamMessage(message, onMessage, onError, onComplete)
```

#### 图片分析
```typescript
// 普通响应
const response = await AIService.analyzeImage(imageUrl, question, false)

// 流式响应
await AIService.analyzeImageStream(imageUrl, question, onMessage, onError, onComplete)
```

### 🎯 使用建议：

1. **首次使用**: 建议先使用普通响应模式测试功能
2. **图片分析**: 确保图片URL可公开访问
3. **问题描述**: 越具体的问题会得到越准确的回答
4. **网络环境**: 流式响应需要稳定的网络连接

### 🔍 故障排除：

1. **API密钥错误**: 检查后端 `.env` 文件中的 `ARK_API_KEY`
2. **用户未登录**: 确保已登录系统
3. **图片无法访问**: 检查图片URL是否有效
4. **网络错误**: 检查后端服务是否正常运行

现在你可以开始使用AI功能了！🎉
