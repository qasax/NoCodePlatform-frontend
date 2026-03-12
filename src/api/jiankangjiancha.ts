// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 健康检查 检测服务是否正常运行，返回 ok 表示服务正常 GET / */
export async function health(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/', {
    method: 'GET',
    ...(options || {}),
  })
}
