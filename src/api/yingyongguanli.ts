// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 创建应用 用户提交应用名称、封面和初始 Prompt 来创建一个新应用，返回应用 ID POST /app/add */
export async function addApp(body: API.AppAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>('/app/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** AI 聊天生成代码（SSE 流式） 用户通过聊天消息驱动 AI 为指定应用生成代码，以 SSE 流式返回结果。仅应用创建者可调用 GET /app/chat/gen/code */
export async function chatToGenCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.chatToGenCodeParams,
  options?: { [key: string]: any }
) {
  return request<API.ServerSentEventString[]>('/app/chat/gen/code', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 删除应用 删除指定应用，仅应用创建者或管理员可操作 POST /app/delete */
export async function deleteApp(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 部署应用 将已生成的应用代码部署到公共目录，生成唯一的访问 URL。仅应用创建者可部署 POST /app/deploy */
export async function deployApp(body: API.AppDeployRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/app/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 编辑应用 用户编辑自己创建的应用名称，仅本人可操作 POST /app/edit */
export async function editApp(body: API.AppEditRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取应用详情（管理员） 管理员根据 ID 获取未脱敏的应用完整数据库信息 GET /app/get */
export async function getAppById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseApp>('/app/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 获取应用详情（脱敏） 根据应用 ID 获取应用的包装视图信息，包含创建者信息 GET /app/get/vo */
export async function getAppVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppVO>('/app/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 分页查询应用列表（管理员） 管理员可不受限制地查询全量应用分页列表，支持按任意字段检索 POST /app/list/page */
export async function listAppByPage(body: API.AppQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageApp>('/app/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询精选应用列表 查询当前平台已发布的精选应用分页列表，每页最多 20 条 POST /app/list/page/vo */
export async function listAppVoByPage(body: API.AppQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageAppVO>('/app/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询我的应用列表 查询当前登录用户自己创建的应用分页列表，每页最多 20 条 POST /app/my/list/page/vo */
export async function listMyAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>('/app/my/list/page/vo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 预览应用 获取已生成应用的预览静态资源地址，仅应用创建者可预览 GET /app/preview/${param0} */
export async function previewApp(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.previewAppParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponseString>(`/app/preview/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** 更新应用（管理员） 管理员可更新任意应用的名称、封面和优先级等信息 POST /app/update */
export async function updateApp(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
