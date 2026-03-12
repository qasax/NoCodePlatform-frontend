# 项目生成进度反馈 - 前端使用示例

## 1. 概述

本文档提供前端开发人员使用项目生成进度反馈 API 的完整示例，包括 Vue/React 实现方案。

## 2. API 接口说明

### 2.1 接口地址
```
GET /app/chat/gen/code
```

### 2.2 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| appId | Long | 是 | 应用 ID |
| message | String | 是 | 用户需求描述 |
| agent | Boolean | 否 | 是否使用 Agent 模式（默认 true）<br>• langchain4j: agent=false<br>• langgraph4j: agent=true |

### 2.3 响应格式
Server-Sent Events (SSE) 流式响应

## 3. Vue 3 实现示例

### 3.1 进度展示组件

```vue
<template>
  <div class="progress-container">
    <!-- 整体进度条 -->
    <div class="overall-progress">
      <a-progress 
        :percent="overallProgress" 
        :stroke-color="progressColor"
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
        <a-icon :type="stageIcon" :style="{ color: stageColor, fontSize: '24px' }" />
        <h3>{{ currentStageName }}</h3>
      </div>
      
      <div class="stage-content">
        <p class="stage-message">{{ currentMessage }}</p>
        
        <!-- 详细信息 -->
        <div v-if="stageDetails" class="stage-details">
          <a-collapse>
            <a-collapse-panel key="1" header="详细信息">
              <pre>{{ formatDetails(stageDetails) }}</pre>
            </a-collapse-panel>
          </a-collapse>
        </div>
        
        <!-- 预计剩余时间 -->
        <div v-if="estimatedTime > 0" class="estimated-time">
          <a-icon type="clock-circle" />
          <span>预计剩余：{{ formatTime(estimatedTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 阶段列表 -->
    <div class="stage-list">
      <div 
        v-for="stage in stages" 
        :key="stage.code"
        :class="['stage-item', { 
          active: stage.code === currentStage, 
          completed: stage.status === 'COMPLETED' 
        }]"
      >
        <div class="stage-item-icon">
          <a-icon 
            v-if="stage.status === 'COMPLETED'" 
            type="check-circle" 
            style="color: #52c41a" 
          />
          <a-icon 
            v-else-if="stage.code === currentStage" 
            type="loading" 
            style="color: #1890ff" 
          />
          <a-icon 
            v-else 
            type="circle" 
            style="color: #d9d9d9" 
          />
        </div>
        <div class="stage-item-info">
          <div class="stage-item-name">{{ stage.name }}</div>
          <div v-if="stage.message" class="stage-item-message">
            {{ stage.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- 完成状态 -->
    <div v-if="workflowCompleted" class="completion-modal">
      <a-result
        status="success"
        title="应用生成完成！"
        sub-title="您的应用已成功生成，现在可以部署使用了"
      >
        <template #extra>
          <a-button type="primary" @click="handleDeploy">立即部署</a-button>
          <a-button @click="handleViewCode">查看代码</a-button>
        </template>
      </a-result>
    </div>

    <!-- 错误状态 -->
    <div v-if="workflowError" class="error-modal">
      <a-result
        status="error"
        title="生成失败"
        :sub-title="errorMessage"
      >
        <template #extra>
          <a-button type="primary" @click="handleRetry">重试</a-button>
          <a-button @click="handleCancel">取消</a-button>
        </template>
      </a-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';

const props = defineProps({
  appId: {
    type: Number,
    required: true
  },
  userMessage: {
    type: String,
    required: true
  }
});

// 状态定义
const overallProgress = ref(0);
const currentStage = ref('');
const currentStageName = ref('');
const currentMessage = ref('');
const stageDetails = ref(null);
const estimatedTime = ref(0);
const workflowCompleted = ref(false);
const workflowError = ref(false);
const errorMessage = ref('');

// 阶段列表
const stages = ref([
  { code: 'WORKFLOW_START', name: '工作流启动', status: 'PENDING', message: '' },
  { code: 'IMAGE_COLLECTION', name: '图片收集', status: 'PENDING', message: '' },
  { code: 'PROMPT_ENHANCEMENT', name: '提示词增强', status: 'PENDING', message: '' },
  { code: 'INTELLIGENT_ROUTING', name: '智能路由', status: 'PENDING', message: '' },
  { code: 'CODE_GENERATION', name: '代码生成', status: 'PENDING', message: '' },
  { code: 'QUALITY_CHECK', name: '质量检查', status: 'PENDING', message: '' },
  { code: 'PROJECT_BUILD', name: '项目构建', status: 'PENDING', message: '' },
  { code: 'WORKFLOW_COMPLETE', name: '工作流完成', status: 'PENDING', message: '' }
]);

// 计算属性
const progressColor = computed(() => {
  if (overallProgress.value === 100) return '#52c41a';
  if (workflowError.value) return '#f5222d';
  return '#1890ff';
});

const stageIcon = computed(() => {
  if (workflowError.value) return 'exclamation-circle';
  if (workflowCompleted.value) return 'check-circle';
  return 'loading';
});

const stageColor = computed(() => {
  if (workflowError.value) return '#f5222d';
  if (workflowCompleted.value) return '#52c41a';
  return '#1890ff';
});

// SSE 连接
let eventSource = null;

const connectSSE = () => {
  const url = `/app/chat/gen/code?appId=${props.appId}&message=${encodeURIComponent(props.userMessage)}&agent=true`;
  
  eventSource = new EventSource(url);
  
  // 监听进度更新
  eventSource.addEventListener('progress_update', handleProgressUpdate);
  
  // 监听完成事件
  eventSource.addEventListener('progress_complete', handleComplete);
  
  // 监听错误事件
  eventSource.addEventListener('progress_error', handleError);
  
  // 监听错误
  eventSource.onerror = handleConnectionError;
};

// 处理进度更新
const handleProgressUpdate = (event) => {
  try {
    const progress = JSON.parse(event.data);
    updateProgress(progress);
  } catch (e) {
    console.error('解析进度数据失败:', e);
  }
};

// 更新进度状态
const updateProgress = (progress) => {
  overallProgress.value = progress.percentComplete || 0;
  currentStage.value = progress.stage?.code || '';
  currentStageName.value = progress.stageName || '';
  currentMessage.value = progress.message || '';
  stageDetails.value = progress.details ? JSON.parse(progress.details) : null;
  estimatedTime.value = progress.estimatedRemainingSeconds || 0;
  
  // 更新阶段状态
  const stageIndex = stages.value.findIndex(s => s.code === progress.stage?.code);
  if (stageIndex !== -1) {
    stages.value[stageIndex].status = progress.status?.code || 'IN_PROGRESS';
    stages.value[stageIndex].message = progress.message || '';
  }
  
  // 检查是否完成
  if (progress.status?.code === 'COMPLETED' && progress.percentComplete === 100) {
    workflowCompleted.value = true;
    eventSource.close();
  }
};

// 处理完成
const handleComplete = (event) => {
  workflowCompleted.value = true;
  overallProgress.value = 100;
  message.success('应用生成完成！');
  eventSource.close();
};

// 处理错误
const handleError = (event) => {
  try {
    const error = JSON.parse(event.data);
    errorMessage.value = error.error || '未知错误';
    workflowError.value = true;
    message.error('生成失败：' + errorMessage.value);
    eventSource.close();
  } catch (e) {
    console.error('解析错误数据失败:', e);
  }
};

// 处理连接错误
const handleConnectionError = () => {
  errorMessage.value = '连接服务器失败，请检查网络连接';
  workflowError.value = true;
  message.error('连接服务器失败');
  eventSource.close();
};

// 格式化时间
const formatTime = (seconds) => {
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs}秒`;
};

// 格式化详情
const formatDetails = (details) => {
  if (!details) return '';
  return JSON.stringify(details, null, 2);
};

// 事件处理
const handleDeploy = () => {
  // 部署逻辑
  message.info('开始部署应用...');
};

const handleViewCode = () => {
  // 查看代码逻辑
  message.info('跳转至代码查看页面...');
};

const handleRetry = () => {
  // 重试逻辑
  workflowError.value = false;
  overallProgress.value = 0;
  connectSSE();
};

const handleCancel = () => {
  // 取消逻辑
  eventSource.close();
};

// 生命周期
onMounted(() => {
  connectSSE();
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
  }
});
</script>

<style scoped>
.progress-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.overall-progress {
  margin-bottom: 24px;
}

.current-stage-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stage-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.stage-header h3 {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 600;
}

.stage-content {
  margin-top: 16px;
}

.stage-message {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
}

.estimated-time {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
  margin-top: 12px;
}

.estimated-time .anticon {
  margin-right: 8px;
}

.stage-list {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stage-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.stage-item:last-child {
  margin-bottom: 0;
}

.stage-item.active {
  background: #e6f7ff;
}

.stage-item.completed {
  background: #f6ffed;
}

.stage-item-icon {
  margin-right: 12px;
  font-size: 18px;
}

.stage-item-info {
  flex: 1;
}

.stage-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.stage-item-message {
  font-size: 12px;
  color: #999;
}
</style>
```

## 4. React 实现示例

### 4.1 进度展示组件

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { Progress, Card, List, Icon, Result, Button, Collapse } from 'antd';
import './ProgressPanel.css';

const { Panel } = Collapse;

const ProgressPanel = ({ appId, userMessage, onComplete, onError }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [currentStageName, setCurrentStageName] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [stageDetails, setStageDetails] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [workflowCompleted, setWorkflowCompleted] = useState(false);
  const [workflowError, setWorkflowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const eventSourceRef = useRef(null);

  const stages = [
    { code: 'WORKFLOW_START', name: '工作流启动', status: 'PENDING' },
    { code: 'IMAGE_COLLECTION', name: '图片收集', status: 'PENDING' },
    { code: 'PROMPT_ENHANCEMENT', name: '提示词增强', status: 'PENDING' },
    { code: 'INTELLIGENT_ROUTING', name: '智能路由', status: 'PENDING' },
    { code: 'CODE_GENERATION', name: '代码生成', status: 'PENDING' },
    { code: 'QUALITY_CHECK', name: '质量检查', status: 'PENDING' },
    { code: 'PROJECT_BUILD', name: '项目构建', status: 'PENDING' },
    { code: 'WORKFLOW_COMPLETE', name: '工作流完成', status: 'PENDING' }
  ];

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const connectSSE = () => {
    const url = `/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(userMessage)}&agent=true`;
    
    eventSourceRef.current = new EventSource(url);
    
    eventSourceRef.current.addEventListener('progress_update', handleProgressUpdate);
    eventSourceRef.current.addEventListener('progress_complete', handleComplete);
    eventSourceRef.current.addEventListener('progress_error', handleError);
    eventSourceRef.current.onerror = handleConnectionError;
  };

  const handleProgressUpdate = (event) => {
    try {
      const progress = JSON.parse(event.data);
      setOverallProgress(progress.percentComplete || 0);
      setCurrentStage(progress.stage?.code || '');
      setCurrentStageName(progress.stageName || '');
      setCurrentMessage(progress.message || '');
      setStageDetails(progress.details ? JSON.parse(progress.details) : null);
      setEstimatedTime(progress.estimatedRemainingSeconds || 0);
    } catch (e) {
      console.error('解析进度数据失败:', e);
    }
  };

  const handleComplete = (event) => {
    setWorkflowCompleted(true);
    setOverallProgress(100);
    eventSourceRef.current.close();
    if (onComplete) onComplete();
  };

  const handleError = (event) => {
    try {
      const error = JSON.parse(event.data);
      setErrorMessage(error.error || '未知错误');
      setWorkflowError(true);
      eventSourceRef.current.close();
      if (onError) onError(error);
    } catch (e) {
      console.error('解析错误数据失败:', e);
    }
  };

  const handleConnectionError = () => {
    setErrorMessage('连接服务器失败，请检查网络连接');
    setWorkflowError(true);
    eventSourceRef.current.close();
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  const getProgressColor = () => {
    if (overallProgress === 100) return '#52c41a';
    if (workflowError) return '#f5222d';
    return '#1890ff';
  };

  const getStageIcon = (stage) => {
    if (stage.status === 'COMPLETED') return 'check-circle';
    if (stage.code === currentStage) return 'loading';
    return 'circle';
  };

  const getStageColor = (stage) => {
    if (stage.status === 'COMPLETED') return '#52c41a';
    if (stage.code === currentStage) return '#1890ff';
    return '#d9d9d9';
  };

  return (
    <div className="progress-panel">
      {/* 整体进度条 */}
      <div className="overall-progress">
        <Progress 
          percent={overallProgress} 
          strokeColor={getProgressColor()}
          format={(percent) => (
            <span style={{ color: '#fff' }}>{percent}%</span>
          )}
        />
      </div>

      {/* 当前阶段卡片 */}
      <Card className="current-stage-card">
        <div className="stage-header">
          <Icon 
            type={workflowError ? 'exclamation-circle' : workflowCompleted ? 'check-circle' : 'loading'} 
            style={{ color: getProgressColor(), fontSize: '24px' }} 
          />
          <h3>{currentStageName || '准备中...'}</h3>
        </div>
        
        <div className="stage-content">
          <p className="stage-message">{currentMessage || '正在初始化...'}</p>
          
          {stageDetails && (
            <Collapse>
              <Panel header="详细信息" key="1">
                <pre>{JSON.stringify(stageDetails, null, 2)}</pre>
              </Panel>
            </Collapse>
          )}
          
          {estimatedTime > 0 && (
            <div className="estimated-time">
              <Icon type="clock-circle" style={{ marginRight: '8px' }} />
              <span>预计剩余：{formatTime(estimatedTime)}</span>
            </div>
          )}
        </div>
      </Card>

      {/* 阶段列表 */}
      <Card className="stage-list-card">
        <List
          dataSource={stages}
          renderItem={(stage) => (
            <List.Item 
              className={`stage-item ${stage.code === currentStage ? 'active' : ''} ${stage.status === 'COMPLETED' ? 'completed' : ''}`}
            >
              <List.Item.Meta
                avatar={
                  <Icon 
                    type={getStageIcon(stage)} 
                    style={{ color: getStageColor(stage), fontSize: '18px' }} 
                  />
                }
                title={stage.name}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 完成状态 */}
      {workflowCompleted && (
        <div className="completion-modal">
          <Result
            status="success"
            title="应用生成完成！"
            subTitle="您的应用已成功生成，现在可以部署使用了"
            extra={[
              <Button type="primary" key="deploy" onClick={() => console.log('deploy')}>
                立即部署
              </Button>,
              <Button key="view" onClick={() => console.log('view code')}>
                查看代码
              </Button>
            ]}
          />
        </div>
      )}

      {/* 错误状态 */}
      {workflowError && (
        <div className="error-modal">
          <Result
            status="error"
            title="生成失败"
            subTitle={errorMessage}
            extra={[
              <Button type="primary" key="retry" onClick={() => window.location.reload()}>
                重试
              </Button>,
              <Button key="cancel" onClick={() => console.log('cancel')}>
                取消
              </Button>
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ProgressPanel;
```

## 5. 调试技巧

### 5.1 浏览器控制台测试

```javascript
// 在浏览器控制台测试 SSE 连接
const es = new EventSource('/app/chat/gen/code?appId=1&message=test&agent=true');

es.addEventListener('progress_update', (e) => {
  console.log('进度更新:', JSON.parse(e.data));
});

es.addEventListener('progress_complete', (e) => {
  console.log('完成:', e.data);
  es.close();
});

es.addEventListener('progress_error', (e) => {
  console.error('错误:', JSON.parse(e.data));
  es.close();
});

es.onerror = (e) => {
  console.error('连接错误:', e);
  es.close();
};
```

### 5.2 常见问题排查

1. **连接失败**: 检查 CORS 配置
2. **消息解析失败**: 确认 JSON 格式
3. **进度不更新**: 检查发送频率限制
4. **连接中断**: 实现自动重连机制

## 6. 最佳实践

### 6.1 性能优化
- 使用防抖减少渲染频率
- 虚拟滚动长列表
- 预加载资源

### 6.2 用户体验
- 显示有意义的进度消息
- 提供取消选项
- 错误时提供明确指引
- 提供 AI 引擎选择（LangChain4j / LangGraph4j）

### 6.3 错误处理
- 实现重试机制
- 友好的错误提示
- 日志记录便于排查

## 7. 新增功能说明

### 7.1 AI 引擎选择器
- **LangChain4j** (基础模式): 使用基础链式调用，适合简单场景
- **LangGraph4j** (高级 Agent): 使用高级 Agent 模式，支持复杂工作流（推荐）

### 7.2 动态进度展示
- 实时进度百分比显示
- 当前阶段名称和描述
- 8 个阶段的完成状态列表：
  1. 工作流启动
  2. 图片收集
  3. 提示词增强
  4. 智能路由
  5. 代码生成
  6. 质量检查
  7. 项目构建
  8. 工作流完成

### 7.3 视觉效果优化
- 渐变进度条带动画
- 阶段状态图标（待处理/进行中/已完成）
- 脉冲动画指示当前活动状态
- 平滑的过渡动画
