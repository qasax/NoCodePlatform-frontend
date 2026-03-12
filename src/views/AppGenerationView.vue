<template>
  <div class="workspace-layout">
    <div class="split-pane">
      <!-- Left Chat Area -->
      <div class="pane-left" :style="{ width: leftPaneWidth + '%' }">
        <div class="chat-header">
          <h2>{{ appDataRef?.appName || '开发助手' }}</h2>
          <span class="status-indicator" :class="{ active: isGenerating }">
            {{ isGenerating ? '正在生成...' : '就绪' }}
          </span>
        </div>

        <div class="chat-container" ref="chatContainer">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="message-bubble"
            :class="msg.role"
          >
            <div class="avatar">
              <span v-if="msg.role === 'user'">U</span>
              <svg
                v-else
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div class="content">
              <!-- AI 消息中显示进度组件 -->
              <div v-if="msg.role === 'ai' && msg.showProgress" class="progress-container">
                <!-- 整体进度条 -->
                <div class="overall-progress">
                  <a-progress
                    :percent="
                      index === messages.length - 1 && isGenerating
                        ? progressPercentage
                        : msg.sseData?.percentComplete || 0
                    "
                    :stroke-color="
                      index === messages.length - 1 && isGenerating
                        ? progressColor
                        : (msg.sseData?.percentComplete || 0) === 100
                          ? '#52c41a'
                          : '#1890ff'
                    "
                    :show-info="true"
                  >
                    <template #format="percent">
                      <span style="color: #fff">{{ percent }}%</span>
                    </template>
                  </a-progress>
                </div>

                <!-- 当前阶段卡片 -->
                <div class="current-stage-card">
                  <div class="stage-header">
                    <a-icon
                      :type="
                        index === messages.length - 1 && isGenerating
                          ? stageIcon
                          : (msg.sseData?.percentComplete || 0) === 100
                            ? 'check-circle'
                            : 'loading'
                      "
                      :style="{
                        color:
                          index === messages.length - 1 && isGenerating
                            ? stageColor
                            : (msg.sseData?.percentComplete || 0) === 100
                              ? '#52c41a'
                              : '#1890ff',
                        fontSize: '24px',
                      }"
                    />
                    <h3>
                      {{
                        index === messages.length - 1 && isGenerating
                          ? currentStageName || '正在处理中...'
                          : msg.sseData?.stageName || '处理完成'
                      }}
                      <span
                        v-if="index === messages.length - 1 && isGenerating"
                        class="processing-indicator"
                      >
                        <a-spin size="small" tip="正在处理中..." :spinning="isGenerating" />
                      </span>
                    </h3>
                  </div>

                  <div class="stage-content">
                    <p class="stage-message">
                      {{
                        index === messages.length - 1 && isGenerating
                          ? currentStageMessage
                          : msg.sseData?.message || ''
                      }}
                    </p>

                    <!-- 预计剩余时间 -->
                    <div
                      v-if="
                        (index === messages.length - 1 && isGenerating && estimatedTime > 0) ||
                        (!isGenerating &&
                          (msg.sseData?.estimatedRemainingSeconds || 0) > 0 &&
                          (msg.sseData?.percentComplete || 0) < 100)
                      "
                      class="estimated-time"
                    >
                      <a-icon type="clock-circle" />
                      <span>
                        预计剩余：{{
                          formatTime(
                            index === messages.length - 1 && isGenerating
                              ? estimatedTime
                              : (msg.sseData?.estimatedRemainingSeconds ?? 0),
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 历史消息仅显示概要或卡片，如果需要显示完整阶段列表，建议将 stages 也持久化，
                     但此处我们至少确保进度条和当前阶段卡片能正确显示历史数据 -->

                <!-- 完成状态 -->
                <div
                  v-if="
                    (index === messages.length - 1 &&
                      !isGenerating &&
                      progressPercentage === 100) ||
                    (index < messages.length - 1 && (msg.sseData?.percentComplete || 0) === 100)
                  "
                  class="completion-status"
                >
                  <a-result
                    status="success"
                    title="处理完成！"
                    sub-title="后端处理已完成，应用已生成"
                  >
                  </a-result>
                </div>
              </div>

              <!-- 普通消息内容 (仅在不显示进度或不是 AI 消息时) -->
              <div v-else class="md-render" v-html="renderMarkdown(getDisplayContent(msg))"></div>
            </div>
          </div>
        </div>

        <div class="chat-input-wrapper">
          <div class="selected-element-alert" v-if="selectedElement">
            <a-alert
              :message="selectedElementTitle"
              type="info"
              show-icon
              closable
              @close="clearSelection"
            >
              <template #description>
                <div class="selector-code">CSS 选择器：{{ selectedElement.selector }}</div>
                <div class="outer-html-preview">
                  {{ selectedElement.outerHTML.slice(0, 120)
                  }}{{ selectedElement.outerHTML.length > 120 ? '...' : '' }}
                </div>
              </template>
            </a-alert>
          </div>

          <!-- 合并后的输入区域 -->
          <div class="combined-input-area">
            <!-- 聊天输入区域 -->
            <div class="input-section">
              <div class="visual-edit-btn-wrapper">
                <a-tooltip :title="isEditMode ? '退出可视化编辑' : '点击元素进行精准编辑'">
                  <a-button
                    :type="isEditMode ? 'primary' : 'default'"
                    shape="circle"
                    @click="toggleEditMode"
                  >
                    <template #icon>
                      <BgColorsOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
              </div>
              <a-input-search
                v-model:value="inputText"
                placeholder="提出修改意见或新需求..."
                enter-button="发送"
                size="large"
                @search="sendMessage"
                :loading="isGenerating"
              />
            </div>

            <!-- Agent 模式选择 -->
            <div class="agent-mode-section">
              <div class="agent-mode-label">AI 引擎：</div>
              <a-radio-group v-model:value="agentMode" button-style="solid">
                <a-radio-button value="langchain4j">
                  <template #icon><RobotOutlined /></template>
                  LangChain4j
                </a-radio-button>
                <a-radio-button value="langgraph4j">
                  <template #icon><ApiOutlined /></template>
                  LangGraph4j
                </a-radio-button>
              </a-radio-group>
              <a-tooltip
                :title="
                  agentMode === 'langgraph4j'
                    ? '使用高级 Agent 模式（推荐）'
                    : '使用基础链式调用模式'
                "
              >
                <a-tag
                  :color="agentMode === 'langgraph4j' ? 'green' : 'blue'"
                  class="agent-mode-tip"
                >
                  {{ agentMode === 'langgraph4j' ? '🚀 高级 Agent' : '🔗 基础模式' }}
                </a-tag>
              </a-tooltip>
            </div>
          </div>
        </div>
      </div>

      <!-- Drag Handle -->
      <div class="drag-resizer" @mousedown="startDrag" title="拖动调整宽度"></div>

      <!-- Right Preview Area -->
      <div class="pane-right" :style="{ width: 100 - leftPaneWidth + '%' }">
        <div class="preview-header">
          <div class="browser-controls">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="url-bar">应用预览</div>
          <div class="preview-actions">
            <a-button
              @click="refreshPreview"
              :disabled="!previewUrl"
              title="刷新预览"
              type="text"
              shape="circle"
            >
              <template #icon><ReloadOutlined /></template>
            </a-button>
            <a-button
              type="primary"
              class="deploy-btn"
              @click="handleDeploy"
              :loading="isDeploying"
            >
              🚀 确认部署
            </a-button>
          </div>
        </div>
        <!-- Iframe container -->
        <div class="iframe-wrapper">
          <div v-if="!previewUrl" class="empty-state">
            <div class="pulse-ring"></div>
            <p>应用代码生成中...</p>
          </div>
          <iframe
            v-else
            ref="previewIframeRef"
            :src="previewUrl"
            class="preview-iframe"
            :class="{ 'edit-mode-cursor': isEditMode }"
            @load="onIframeLoad"
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { deployApp, previewApp, getAppVoById } from '@/api/yingyongguanli'
import { listChatHistoryVoByPage } from '@/api/duihualishiguanli'
import { ReloadOutlined, BgColorsOutlined, RobotOutlined, ApiOutlined } from '@ant-design/icons-vue'
import { useVisualEditor } from '@/composables/useVisualEditor'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// Configure marked with highlight.js
marked.use({
  breaks: true,
  gfm: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      const highlighted = hljs.highlight(text, { language, ignoreIllegals: true }).value
      const langLabel = language !== 'plaintext' ? language : ''
      return [
        `<div class="code-block">`,
        `<div class="code-block-header">`,
        langLabel
          ? `<span class="code-lang">${langLabel}</span>`
          : `<span class="code-lang">code</span>`,
        `<button class="code-copy-btn" onclick="(function(btn){var code=btn.closest('.code-block').querySelector('code');navigator.clipboard.writeText(code.innerText).then(function(){btn.textContent='已复制';setTimeout(function(){btn.textContent='复制'},2000)}).catch(function(){})})(this)">复制</button>`,
        `</div>`,
        `<pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>`,
        `</div>`,
      ].join('')
    },
  },
})

const renderMarkdown = (text: string): string => {
  if (!text) return ''
  try {
    return (marked.parse(text) as string) || ''
  } catch (err) {
    console.error('Markdown parse error:', err)
    return text.replace(/\n/g, '<br/>')
  }
}

const hasSelectedDomKeys = (payload: unknown): payload is Record<string, unknown> => {
  if (!payload || typeof payload !== 'object') return false
  const obj = payload as Record<string, unknown>
  return (
    typeof obj.tagName === 'string' &&
    typeof obj.selector === 'string' &&
    typeof obj.outerHTML === 'string'
  )
}

const stripSelectedDomPayload = (content: string): string => {
  const text = (content || '').trim()
  if (!text || !text.includes('{')) return text

  const startIndexes: number[] = []
  for (let i = text.indexOf('{'); i !== -1; i = text.indexOf('{', i + 1)) {
    startIndexes.push(i)
  }

  for (let i = startIndexes.length - 1; i >= 0; i--) {
    const start = startIndexes[i]
    const candidate = text.slice(start).trim()
    if (!candidate.endsWith('}')) continue
    try {
      const parsed = JSON.parse(candidate)
      if (hasSelectedDomKeys(parsed)) {
        const userText = text.slice(0, start).trim()
        return userText || text
      }
    } catch {
      // ignore parse failures and continue trying earlier "{"
    }
  }

  return text
}

const getDisplayContent = (msg: { role: 'user' | 'ai'; content: string }): string => {
  if (msg.role !== 'user') return msg.content
  return stripSelectedDomPayload(msg.content)
}

const route = useRoute()
const appId = route.params.appId as string

// Layout state
const leftPaneWidth = ref(40) // Percentage
const isDragging = ref(false)

// ... (SSE/UI related state remains same)
const messages = ref<
  {
    role: 'user' | 'ai'
    content: string
    isCollapsed?: boolean
    sseData?: SSEProgressData
    showProgress?: boolean
  }[]
>([])
const inputText = ref('')
const isGenerating = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

// Preview & Deploy state
const previewUrl = ref('')
const previewIframeRef = ref<HTMLIFrameElement | null>(null)
const isDeploying = ref(false)

// Visual Editor
const { isEditMode, selectedElement, toggleEditMode, clearSelection, onIframeLoad } =
  useVisualEditor(previewIframeRef)

// Alert 标题计算属性（避免在模板属性值中嵌套引号导致解析错误）
const selectedElementTitle = computed(() => {
  if (!selectedElement.value) return ''
  const el = selectedElement.value
  const idPart = el.id ? ` id="${el.id}"` : ''
  return `已选中元素: <${el.tagName.toLowerCase()}${idPart}>`
})

onMounted(async () => {
  // Add mouse event listeners for split pane resizer
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)

  await startInitialGeneration()
})

// ... drag and scroll functions ...
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  document.body.style.cursor = 'col-resize'
  // 防止拖动时选中文本
  document.body.style.userSelect = 'none'
  // 禁用 iframe 的指针事件，防止拦截鼠标事件
  if (previewIframeRef.value) {
    previewIframeRef.value.style.pointerEvents = 'none'
  }
  // 添加全局拖动监听，即使鼠标离开拖动条也能继续拖动
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  const containerWidth = document.body.clientWidth
  let newWidth = (e.clientX / containerWidth) * 100
  if (newWidth < 20) newWidth = 20
  if (newWidth > 80) newWidth = 80
  leftPaneWidth.value = newWidth
}

const stopDrag = () => {
  isDragging.value = false
  document.body.style.cursor = 'default'
  document.body.style.userSelect = 'auto'
  // 恢复 iframe 的指针事件
  if (previewIframeRef.value) {
    previewIframeRef.value.style.pointerEvents = 'auto'
  }
  // 移除全局监听
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// Agent 模式选择：langchain4j=false, langgraph4j=true
const agentMode = ref<'langchain4j' | 'langgraph4j'>('langgraph4j')

// 添加进度相关状态
const progressPercentage = ref(0)
const currentStageCode = ref('')
const currentStageName = ref('')
const currentStageMessage = ref('')
const stageDetails = ref(null)
const estimatedTime = ref(0)
const workflowCompleted = ref(false)
const workflowError = ref(false)
const errorMessage = ref('')

const stages = ref([
  { code: 'WORKFLOW_START', name: '工作流启动', status: 'PENDING', message: '' },
  { code: 'IMAGE_COLLECTION', name: '图片收集', status: 'PENDING', message: '' },
  { code: 'PROMPT_ENHANCEMENT', name: '提示词增强', status: 'PENDING', message: '' },
  { code: 'INTELLIGENT_ROUTING', name: '智能路由', status: 'PENDING', message: '' },
  { code: 'CODE_GENERATION', name: '代码生成', status: 'PENDING', message: '' },
  { code: 'QUALITY_CHECK', name: '质量检查', status: 'PENDING', message: '' },
  { code: 'PROJECT_BUILD', name: '项目构建', status: 'PENDING', message: '' },
  { code: 'WORKFLOW_COMPLETE', name: '工作流完成', status: 'PENDING', message: '' },
])

// 计算属性
const progressColor = computed(() => {
  if (progressPercentage.value === 100) return '#52c41a'
  if (workflowError.value) return '#f5222d'
  return '#1890ff'
})

const stageIcon = computed(() => {
  if (workflowError.value) return 'exclamation-circle'
  if (workflowCompleted.value) return 'check-circle'
  return 'loading'
})

const stageColor = computed(() => {
  if (workflowError.value) return '#f5222d'
  if (workflowCompleted.value) return '#52c41a'
  return '#1890ff'
})

// 格式化时间
const formatTime = (seconds: number | string): string => {
  const s = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds
  if (isNaN(s)) return '0秒'
  if (s < 60) return `${s}秒`
  const minutes = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${minutes}分${secs}秒`
}

const DEFAULT_AI_MSG = '**处理完成**\n\n应用生成完成'

interface SSEProgressData {
  stage?: string
  stageName?: string
  message?: string
  percentComplete?: number
  estimatedRemainingSeconds?: number
  status?: string | { code: string }
  details?: string
}

// 处理 SSE 事件数据
const processSSEData = (
  data: string,
  isHistory: boolean = false,
): { content: string; sseData?: SSEProgressData } => {
  let textToProcess = data
  try {
    const parsedData = JSON.parse(data)
    if (parsedData && typeof parsedData === 'object' && parsedData.d) {
      textToProcess = parsedData.d as string
    }
  } catch {
    // 忽略解析错误，使用原始数据
  }

  // 处理嵌套或原始 SSE 格式
  if (
    textToProcess.includes('event: progress_update') ||
    textToProcess.includes('event: progress_complete') ||
    textToProcess.includes('"stage":')
  ) {
    // 采用更健壮的分隔方式：双换行、单换行或 event: 前缀回瞻
    const events = textToProcess.split(/\n\n|\r\n\r\n|(?=event: progress_)/).filter((s) => s.trim())
    let finalSummary = ''
    let lastProgressData: SSEProgressData | undefined

    events.forEach((eventStr) => {
      let jsonStr = ''
      const dataMatch = eventStr.match(/data:\s*({.*})/s)
      if (dataMatch && dataMatch[1]) {
        jsonStr = dataMatch[1].trim()
      } else {
        const directMatch = eventStr.match(/({.*})/s)
        if (directMatch && directMatch[1]) {
          jsonStr = directMatch[1].trim()
        }
      }

      if (jsonStr) {
        try {
          const progressData = JSON.parse(jsonStr) as SSEProgressData
          if (progressData) {
            // 只要有任何进度信息就记录，不强制要求 stage 属性
            lastProgressData = progressData

            // 检查是否是完成事件
            const isComplete =
              eventStr.includes('event: progress_complete') || progressData.percentComplete === 100

            if (isComplete) {
              if (lastProgressData) {
                lastProgressData.percentComplete = 100
              }
              finalSummary = `**处理完成**\n\n${progressData.message || '应用生成完成'}`
            } else if (progressData.stage || progressData.percentComplete !== undefined) {
              finalSummary = `**${progressData.stageName || '处理中'}**\n\n${progressData.message || ''}\n\n进度：${progressData.percentComplete || 0}%\n预计剩余：${formatTime(progressData.estimatedRemainingSeconds ?? 0)}`
            }

            if (!isHistory) {
              updateProgress(lastProgressData)
            }
          }
        } catch (err) {
          console.error('Failed to parse SSE event JSON:', err, jsonStr)
        }
      }
    })
    return {
      content: finalSummary || textToProcess,
      sseData: lastProgressData,
    }
  }

  return { content: textToProcess }
}

// 更新进度状态
const updateProgress = (progress: SSEProgressData) => {
  progressPercentage.value = progress.percentComplete || 0
  currentStageCode.value = progress.stage || ''
  currentStageName.value = progress.stageName || ''
  currentStageMessage.value = progress.message || ''
  stageDetails.value = progress.details ? JSON.parse(progress.details) : null
  estimatedTime.value = progress.estimatedRemainingSeconds || 0

  // 更新阶段状态
  if (progress.stage) {
    const stageIndex = stages.value.findIndex((s) => s.code === progress.stage)
    if (stageIndex !== -1 && stages.value[stageIndex]) {
      // 根据状态更新阶段
      const status = typeof progress.status === 'string' ? progress.status : progress.status?.code
      if (status === 'COMPLETED') {
        stages.value[stageIndex].status = 'COMPLETED'
      } else {
        stages.value[stageIndex].status = 'IN_PROGRESS'
      }
      stages.value[stageIndex].message = progress.message || ''

      // 将之前的阶段标记为完成
      for (let i = 0; i < stageIndex; i++) {
        const stage = stages.value[i]
        if (stage && stage.status !== 'COMPLETED') {
          stage.status = 'COMPLETED'
        }
      }
    }
  }

  // 检查是否完成
  const status = typeof progress.status === 'string' ? progress.status : progress.status?.code
  if (status === 'COMPLETED' && progress.percentComplete === 100) {
    workflowCompleted.value = true
  }
}

// SSE连接状态管理
const sseConnection = ref<{
  eventSource: EventSource | null
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectDelay: number
  maxReconnectDelay: number
  isReconnecting: boolean
  promptStr: string
  selectedElementInfo: any
  aiMessageIndex: number
  isCompleted: boolean
}>({
  eventSource: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000, // 初始延迟1秒
  maxReconnectDelay: 30000, // 最大延迟30秒
  isReconnecting: false,
  promptStr: '',
  selectedElementInfo: null,
  aiMessageIndex: -1,
  isCompleted: false,
})

// 处理SSE完成后的工作流
const handleSSECompletion = async () => {
  try {
    // 首先获取应用详情，查询项目类型
    const appDetailRes = (await getAppVoById({ id: appId as unknown as number })) as any
    const codeGenType = appDetailRes?.codeGenType

    // 根据项目类型更新预览框内容
    if (codeGenType) {
      // 构建预览URL
      const suffix = codeGenType === 'vue_project' ? '/dist/index.html' : '/'
      const previewPath = `/api/static/${codeGenType}_${appId}${suffix}`

      // 强制刷新预览框：先清空URL，再设置新URL，确保iframe重新加载
      previewUrl.value = ''
      setTimeout(() => {
        previewUrl.value = previewPath
      }, 50)
    } else {
      // 如果没有获取到项目类型，加载默认预览
      loadPreview()
      // 强制刷新预览框
      setTimeout(() => {
        if (previewUrl.value) {
          const currentUrl = previewUrl.value
          previewUrl.value = ''
          setTimeout(() => {
            previewUrl.value = currentUrl
          }, 50)
        }
      }, 50)
    }

    // 标记生成完成
    isGenerating.value = false
  } catch (error) {
    console.error('处理SSE完成工作流失败:', error)
    // 出错时加载默认预览
    loadPreview()
    // 强制刷新预览框
    setTimeout(() => {
      if (previewUrl.value) {
        const currentUrl = previewUrl.value
        previewUrl.value = ''
        setTimeout(() => {
          previewUrl.value = currentUrl
        }, 50)
      }
    }, 50)
    isGenerating.value = false
  }
}

// 重新建立SSE连接
const reconnectSSE = () => {
  if (
    sseConnection.value.isCompleted ||
    sseConnection.value.reconnectAttempts >= sseConnection.value.maxReconnectAttempts
  ) {
    return
  }

  sseConnection.value.isReconnecting = true
  sseConnection.value.reconnectAttempts++

  // 指数退避策略
  const delay = Math.min(
    sseConnection.value.reconnectDelay * Math.pow(2, sseConnection.value.reconnectAttempts - 1),
    sseConnection.value.maxReconnectDelay,
  )

  setTimeout(() => {
    if (!sseConnection.value.isCompleted) {
      establishSSEConnection(
        sseConnection.value.promptStr,
        sseConnection.value.selectedElementInfo,
        sseConnection.value.aiMessageIndex,
      )
    }
  }, delay)
}

// 建立SSE连接
const establishSSEConnection = (
  promptStr: string,
  selectedElementInfo: any = null,
  aiMessageIndex: number = -1,
) => {
  isGenerating.value = true

  // 保存连接信息
  sseConnection.value.promptStr = promptStr
  sseConnection.value.selectedElementInfo = selectedElementInfo
  sseConnection.value.isReconnecting = false

  // 如果是首次连接，添加消息
  if (aiMessageIndex === -1) {
    if (promptStr) {
      messages.value.push({ role: 'user', content: promptStr })
    }
    aiMessageIndex = messages.value.length
    messages.value.push({ role: 'ai', content: '', isCollapsed: false })
  }
  sseConnection.value.aiMessageIndex = aiMessageIndex

  const useAgent = agentMode.value === 'langgraph4j'

  // 构建请求参数
  let sseUrl = `/api/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(promptStr)}&agent=${useAgent}`

  // 如果有选中元素信息，添加到请求参数中
  if (selectedElementInfo) {
    sseUrl += `&selectedElement=${encodeURIComponent(JSON.stringify(selectedElementInfo))}`
  }

  // 添加重连标记
  sseUrl += `&reconnect=${sseConnection.value.reconnectAttempts > 0}`

  try {
    const eventSource = new EventSource(sseUrl, { withCredentials: true })
    sseConnection.value.eventSource = eventSource

    // 监听普通消息（用于 AI 回复内容和嵌套的 SSE 事件）
    eventSource.onmessage = (event) => {
      if (event.data && messages.value[aiMessageIndex]) {
        const message = messages.value[aiMessageIndex]
        if (message) {
          const isProgress =
            event.data.includes('event: progress_update') ||
            event.data.includes('event: progress_complete')
          const result = processSSEData(event.data, false)
          if (result.content) {
            if (isProgress) {
              // 进度更新采用替换模式，保持唯一状态显示
              message.content = result.content
              if (result.sseData) {
                message.sseData = result.sseData
                message.showProgress = true
              }
            } else {
              // 普通文本采用追加模式，支持流式对话
              message.content += result.content
            }
            scrollToBottom()
          }
        }
      }
    }

    eventSource.addEventListener('done', () => {
      eventSource.close()
      sseConnection.value.eventSource = null
      sseConnection.value.isCompleted = true
      // 保持 isGenerating 为 true，直到重定向完成
      progressPercentage.value = 100
      // 将所有阶段标记为完成
      stages.value.forEach((stage) => {
        stage.status = 'COMPLETED'
      })
      // 更新当前AI消息的状态，确保预计剩余时间不显示
      if (messages.value[aiMessageIndex]) {
        const message = messages.value[aiMessageIndex]
        if (message) {
          if (!message.sseData) {
            message.sseData = {}
          }
          if (message.sseData) {
            message.sseData.estimatedRemainingSeconds = 0
            message.sseData.percentComplete = 100
          }
        }
      }
      // 处理SSE完成后的工作流
      handleSSECompletion()
    })

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      if (eventSource.readyState === EventSource.CLOSED) {
        // 正常关闭不打扰
        if (!sseConnection.value.isCompleted) {
          // 尝试重连
          reconnectSSE()
        }
      } else {
        eventSource.close()
        sseConnection.value.eventSource = null
        // 尝试重连
        reconnectSSE()
      }
    }
  } catch (error) {
    console.error('建立SSE连接失败:', error)
    // 尝试重连
    reconnectSSE()
  }
}

// Real SSE logic
const fetchSSE = (promptStr: string, selectedElementInfo: any = null) => {
  // 重置进度状态
  progressPercentage.value = 0
  currentStageCode.value = ''
  currentStageName.value = ''
  currentStageMessage.value = ''
  stageDetails.value = null
  estimatedTime.value = 0
  workflowCompleted.value = false
  workflowError.value = false
  errorMessage.value = ''
  stages.value.forEach((stage) => {
    stage.status = 'PENDING'
    stage.message = ''
  })

  // 重置连接状态
  sseConnection.value = {
    eventSource: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    maxReconnectDelay: 30000,
    isReconnecting: false,
    promptStr,
    selectedElementInfo,
    aiMessageIndex: -1,
    isCompleted: false,
  }

  // 建立连接
  establishSSEConnection(promptStr, selectedElementInfo)
}

// 页面加载时初始化
onMounted(async () => {
  // Add mouse event listeners for split pane resizer
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)

  await startInitialGeneration()
})

const appDataRef = ref<API.AppVO | null>(null)

const startInitialGeneration = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appDetailRes = (await getAppVoById({ id: appId as unknown as number })) as any
    appDataRef.value = appDetailRes // request.ts 已经 unwrapped 到 data.data 了
  } catch (error) {
    console.error('获取应用详情失败:', error)
  }

  // Load chat history
  try {
    const historyRes = await listChatHistoryVoByPage({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      appId: appId as any,
      pageNum: 1,
      pageSize: 100, // Load a reasonable amount of history
      sortOrder: 'ascend', // Or handled by backend natively if it defaults to ascend by request or default order. We request ascending.
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const historyData = (historyRes as any) || {}
    const records = historyData.records || []
    console.log('AppGenerationView: Loaded history records:', records.length)
    if (records.length > 0) {
      // 确认后端返回的顺序。如果 records[0] 的时间比 records[1] 晚，说明是倒序，需要 reverse
      const historyMessages = records
        .map((record: API.ChatHistoryVO) => {
          // 适配多种可能的 messageType 值
          const role =
            record.messageType === 'ai' ||
            record.messageType === 'ai_reply' ||
            record.messageType === 'assistant'
              ? 'ai'
              : 'user'

          // 处理 AI 消息的 SSE 格式 - 与实时 SSE 处理逻辑保持一致
          let content = record.message || ''
          let sseData: SSEProgressData | undefined
          let showProgress = false

          if (role === 'ai') {
            try {
              // 尝试解析 SSE 格式的消息
              if (
                content &&
                (content.includes('event: progress_update') ||
                  content.includes('event: progress_complete') ||
                  content.includes('data:{"d":"event:'))
              ) {
                // 使用统一的 SSE 处理函数
                const result = processSSEData(content, true)
                content = result.content || content
                if (result.sseData) {
                  sseData = result.sseData
                  showProgress = true
                }
              } else if (!content) {
                // 处理空消息情况
                content = DEFAULT_AI_MSG
              }
            } catch (e) {
              console.error('解析历史 AI 消息失败:', e)
            }
          }

          return {
            role: role as 'user' | 'ai',
            content,
            isCollapsed: false,
            sseData,
            showProgress,
          }
        })
        .reverse() // 后端返回的是倒序（最新在前），前端展示需要正序（最早在前）
      messages.value = historyMessages
      console.log('AppGenerationView: Formatted history messages:', messages.value.length)
      scrollToBottom()
    }
  } catch (error) {
    console.error('获取历史对话失败:', error)
  }

  // 优先从 URL query 中获取传过来的 prompt
  const queryPrompt = route.query.prompt as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prompt = queryPrompt || (appDataRef.value as any)?.initPrompt || ''

  // If we already have history and no new query prompt, we might not want to re-trigger SSE immediately
  // unless we specifically need to. Let's trigger SSE if it's a completely new app (no history) and prompt exists.
  if (prompt && messages.value.length === 0) {
    fetchSSE(prompt)
  } else if (messages.value.length > 0) {
    loadPreview() // Load preview immediately if history exists
  }
}

const sendMessage = () => {
  const text = inputText.value.trim()
  if (!text || isGenerating.value) return

  // 准备选中元素信息
  let selectedElementInfo = null
  if (selectedElement.value) {
    selectedElementInfo = {
      tagName: selectedElement.value.tagName,
      id: selectedElement.value.id,
      className: selectedElement.value.className,
      selector: selectedElement.value.selector,
      outerHTML: selectedElement.value.outerHTML,
    }

    // Reset visual editor state after sending
    clearSelection()
    if (isEditMode.value) {
      toggleEditMode()
    }
  }

  inputText.value = ''
  fetchSSE(text, selectedElementInfo)
}

const loadPreview = async () => {
  try {
    const codeGenType = appDataRef.value?.codeGenType
    if (codeGenType) {
      const suffix = codeGenType === 'vue_project' ? '/dist/index.html' : '/'
      previewUrl.value = `/api/static/${codeGenType}_${appId}${suffix}`
      return
    }

    // fallback mapping if no codegentype available right away
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawRes = await previewApp({ appId: appId as any })
    let res = (rawRes as unknown as string) || ''

    // 如果是 vue_project，且路径还没包含 dist/index.html，则追加
    if (codeGenType === 'vue_project' || res.includes('vue_project')) {
      if (!res.endsWith('/dist/index.html') && !res.endsWith('/dist/index.html/')) {
        // 去掉末尾斜杠再拼接
        res = res.replace(/\/$/, '') + '/dist/index.html'
      }
    }

    // If successful, returns the sandbox HTML URL
    if (res && typeof res === 'string' && res.indexOf('http') !== 0) {
      // Assuming it's a relative path from the backend
      previewUrl.value = res
    } else {
      previewUrl.value = res
    }
  } catch (error) {
    console.error(error)
    // message.error('获取预览地址失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

const refreshPreview = () => {
  if (previewUrl.value) {
    // Force iframe reload by slightly altering URL or setting it again
    const currentUrl = previewUrl.value
    previewUrl.value = ''
    setTimeout(() => {
      previewUrl.value = currentUrl
    }, 50)
  }
}

const handleDeploy = async () => {
  if (!previewUrl.value) {
    message.warning('应用尚未生成完毕')
    return
  }

  isDeploying.value = true
  try {
    const res = await deployApp({ appId: appId as unknown as number })
    const deployUrl = res as unknown as string // The deployed permanent URL

    Modal.success({
      title: '部署成功！',
      content: `您的应用已成功上线。\n访问地址：${deployUrl}`,
      okText: '立即访问',
      onOk() {
        window.open(deployUrl, '_blank')
      },
    })
  } catch (err) {
    message.error('部署失败: ' + (err instanceof Error ? err.message : String(err)))
  } finally {
    isDeploying.value = false
  }
}
</script>

<style>
/* hljs global colors – required because v-html bypass scoped */
.hljs {
  background: #1e1e2e !important;
  color: #cdd6f4 !important;
}
.chat-input-area .ant-input-search > .ant-input-group > .ant-input-affix-wrapper,
.chat-input-area .ant-input-search > .ant-input-group > .ant-input-wrapper > .ant-input {
  border: none;
  box-shadow: none;
  background: transparent;
}
.chat-input-area .ant-input-search .ant-input-group-addon .ant-btn {
  border-radius: 20px;
  margin-right: 4px;
}
</style>

<style scoped>
.workspace-layout {
  height: calc(100vh - 64px);
  background: #f8f9fc;
  overflow: hidden;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
}

.split-pane {
  display: flex;
  height: 100%;
  width: 100%;
}

/* Left Pane Chat */
.pane-left {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  position: relative;
  /* Minimal separation instead of hard borders */
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.02);
  z-index: 1;
}

.chat-header {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(229, 231, 235, 0.4);
}

.chat-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.status-indicator {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.status-indicator.active::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
  animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 80px 24px 180px; /* Spacer for fixed header and floating input */
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 进度容器 - 在 AI 消息气泡内部 */
.progress-container {
  padding: 16px;
}

/* 整体进度条 */
.overall-progress {
  margin-bottom: 16px;
}

/* 当前阶段卡片 */
.current-stage-card {
  background: #f0f5ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #d6e4ff;
}

.stage-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.stage-header h3 {
  margin: 0 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.processing-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

.processing-indicator :deep(.ant-spin-text) {
  font-size: 12px;
  color: #666;
  margin-left: 4px;
}

.stage-content {
  margin-top: 12px;
}

.stage-message {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.6;
}

.estimated-time {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 13px;
  margin-top: 8px;
}

.estimated-time .anticon {
  margin-right: 6px;
  color: #1890ff;
}

/* 阶段列表 */
.stage-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stage-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  background: #fafafa;
}

.stage-item.active {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
}

.stage-item.completed {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
}

.stage-item-icon {
  margin-right: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-item-info {
  flex: 1;
  min-width: 0;
}

.stage-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.stage-item-message {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 完成状态样式 */
.completion-status {
  padding: 20px;
  text-align: center;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
}

.completion-status :deep(.ant-result) {
  margin: 0;
}

.completion-status :deep(.ant-result-title) {
  font-size: 18px;
  color: #52c41a;
}

.completion-status :deep(.ant-result-subtitle) {
  color: #666;
  margin-top: 8px;
  margin-bottom: 24px;
}

.completion-status :deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.3);
}

.completion-status :deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
}

.message-bubble {
  display: flex;
  gap: 16px;
  max-width: 92%;
}

.message-bubble.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.user .avatar {
  background: #f1f5f9;
  color: #334155;
}

.ai .avatar {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.content {
  border-radius: 16px;
  line-height: 1.7;
  font-size: 14.5px;
  letter-spacing: -0.01em;
  max-width: 100%;
  word-break: break-word;
}

/* User bubble */
.user .content {
  background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%);
  color: #1e293b;
  border-bottom-right-radius: 4px;
  padding: 12px 18px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
}

.user .content :deep(p) {
  margin: 0;
}

/* AI bubble */
.ai .content {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  color: #1e293b;
  border-top-left-radius: 4px;
  box-shadow:
    0 8px 24px rgba(15, 23, 42, 0.04),
    0 1px 3px rgba(15, 23, 42, 0.02);
  width: 100%;
  overflow: hidden;
}

/* ============================
   Markdown Render Base
   ============================ */
.md-render {
  padding: 14px 18px;
  font-size: 14.5px;
  line-height: 1.75;
  color: #1e293b;
}

.md-render :deep(p) {
  margin: 0 0 10px;
}
.md-render :deep(p:last-child) {
  margin-bottom: 0;
}

.md-render :deep(h1),
.md-render :deep(h2),
.md-render :deep(h3),
.md-render :deep(h4) {
  font-weight: 700;
  margin: 18px 0 8px;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.md-render :deep(h1) {
  font-size: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 6px;
}
.md-render :deep(h2) {
  font-size: 17px;
}
.md-render :deep(h3) {
  font-size: 15px;
}
.md-render :deep(h4) {
  font-size: 14px;
  color: #475569;
}

.md-render :deep(ul),
.md-render :deep(ol) {
  padding-left: 22px;
  margin: 6px 0 12px;
}
.md-render :deep(li) {
  margin: 4px 0;
}

/* Inline code */
.md-render :deep(code):not(pre > code) {
  background: #f1f5f9;
  color: #d6336c;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  padding: 1px 6px;
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* ============================
   Code block with header bar
   ============================ */
.md-render :deep(.code-block) {
  margin: 14px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #1e1e2e;
}

.md-render :deep(.code-block-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #2a2a3d;
  border-bottom: 1px solid #3a3a52;
}

.md-render :deep(.code-lang) {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.md-render :deep(.code-copy-btn) {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 5px;
  color: #94a3b8;
  font-size: 11px;
  padding: 2px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.md-render :deep(.code-copy-btn:hover) {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.md-render :deep(.code-block pre.hljs) {
  margin: 0;
  padding: 16px 18px;
  background: #1e1e2e;
  border-radius: 0;
  overflow-x: auto;
  line-height: 1.65;
  border: none;
}

.md-render :deep(.code-block pre.hljs code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  background: transparent;
  color: #cdd6f4;
  padding: 0;
}

/* Blockquote */
.md-render :deep(blockquote) {
  border-left: 3px solid #818cf8;
  margin: 12px 0;
  padding: 8px 16px;
  color: #475569;
  background: #f8fafc;
  border-radius: 0 8px 8px 0;
}

/* HR */
.md-render :deep(hr) {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 14px 0;
}

/* Link */
.md-render :deep(a) {
  color: #6366f1;
  text-decoration: none;
}
.md-render :deep(a:hover) {
  text-decoration: underline;
}

/* Table */
.md-render :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 13.5px;
  border-radius: 8px;
  overflow: hidden;
}
.md-render :deep(th),
.md-render :deep(td) {
  padding: 9px 14px;
  border: 1px solid #e2e8f0;
  text-align: left;
}
.md-render :deep(th) {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
}

/* Floating Input Area */
.chat-input-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to top, #ffffff 60%, rgba(255, 255, 255, 0) 100%);
  z-index: 10;
  pointer-events: none;
}

.combined-input-area {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease-out;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border-radius: 24px 24px 12px 12px;
  border: 1px solid rgba(203, 213, 225, 0.6);
  box-shadow:
    0 12px 32px rgba(15, 23, 42, 0.08),
    0 2px 6px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.agent-mode-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(241, 245, 249, 0.8);
  border-top: 1px solid rgba(203, 213, 225, 0.5);
}

.input-section {
  padding: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.input-section :deep(.ant-input-search) {
  flex: 1;
}

.combined-input-area:focus-within {
  transform: translateY(-2px);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.12),
    0 2px 8px rgba(15, 23, 42, 0.06);
  border-color: rgba(148, 163, 184, 0.8);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.agent-mode-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.agent-mode-selector :deep(.ant-radio-group) {
  flex: 1;
}

.agent-mode-selector :deep(.ant-radio-button-wrapper) {
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.agent-mode-selector :deep(.ant-radio-button-wrapper:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.agent-mode-selector :deep(.ant-radio-button-wrapper-checked) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.agent-mode-selector :deep(.ant-radio-button-wrapper-checked:hover) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.agent-mode-selector :deep(.anticon) {
  margin-right: 4px;
}

.agent-mode-tip {
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.agent-mode-tip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.selected-element-alert {
  pointer-events: auto;
  margin-bottom: 12px;
  animation: slideUp 0.3s ease-out;
}

.selector-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
}

.visual-edit-btn-wrapper {
  padding-left: 8px;
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.selector-code {
  font-size: 12px;
  color: #595959;
  margin-bottom: 4px;
}

.outer-html-preview {
  margin-top: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: #8c8c8c;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  padding: 4px 8px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 60px;
  overflow: hidden;
}

/* Drag Handle */
.drag-resizer {
  width: 8px;
  background: rgba(0, 0, 0, 0.02);
  cursor: col-resize;
  transition: all 0.2s ease;
  z-index: 20;
  position: relative;
  flex-shrink: 0;
}

.drag-resizer::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 40px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  transition: all 0.2s ease;
}

.drag-resizer:hover {
  background: rgba(59, 130, 246, 0.1);
}

.drag-resizer:hover::before {
  background: rgba(59, 130, 246, 0.6);
  height: 60px;
}

.drag-resizer:active {
  background: rgba(59, 130, 246, 0.2);
}

.drag-resizer:active::before {
  background: rgba(59, 130, 246, 0.8);
  height: 80px;
}

/* Right Pane Preview */
.pane-right {
  display: flex;
  flex-direction: column;
  background: #18181b; /* Sleeker dark for window feel */
}

.preview-header {
  height: 52px;
  background: #18181b;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
  border-bottom: 1px solid #27272a;
}

.browser-controls {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  opacity: 0.8;
}
.pane-right:hover .dot {
  opacity: 1;
}
.red {
  background: #ff5f56;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}
.yellow {
  background: #ffbd2e;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}
.green {
  background: #27c93f;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.url-bar {
  flex: 1;
  background: #27272a;
  border-radius: 8px;
  padding: 6px 16px;
  color: #a1a1aa;
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  border: 1px solid #3f3f46;
  text-align: center;
  pointer-events: none;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-actions :deep(.ant-btn-text) {
  color: #a1a1aa;
}
.preview-actions :deep(.ant-btn-text:hover) {
  color: #ffffff;
  background: #27272a;
}

.deploy-btn {
  background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
  border: 1px solid #3f3f46;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  color: #f4f4f5;
  transition: all 0.2s ease;
}

.deploy-btn:hover {
  background: linear-gradient(135deg, #27272a 0%, #3f3f46 100%);
  border-color: #52525b;
  color: #ffffff;
}

.iframe-wrapper {
  flex: 1;
  position: relative;
  background: #ffffff;
  border-top-left-radius: 8px;
  margin: 0 2px 2px 2px;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
  transition: box-shadow 0.25s ease;
}

.preview-iframe.edit-mode-cursor {
  box-shadow: inset 0 0 0 2px #1890ff;
  cursor: crosshair;
}

.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: #f8fafc;
}

.pulse-ring {
  width: 64px;
  height: 64px;
  border: 2px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}
</style>
