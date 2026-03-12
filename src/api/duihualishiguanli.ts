// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 分页查询对话历史列表（管理员） 管理员可查询全量对话历史分页列表，倒序展示 POST /chat_history/list/page */
export async function listChatHistoryByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageChatHistory>('/chat_history/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询应用的对话历史视图 根据 appId 获取应用对应的聊天历史，仅应用创建者可见。每次请求10条。 POST /chat_history/list/page/vo */
export async function listChatHistoryVoByPage(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageChatHistoryVO>('/chat_history/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
