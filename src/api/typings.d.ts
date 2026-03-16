declare namespace API {
  type App = {
    id?: number
    appName?: string
    cover?: string
    initPrompt?: string
    codeGenType?: string
    deployKey?: string
    deployedTime?: string
    priority?: number
    userId?: number
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type AppAddRequest = {
    /** 应用名称 */
    appName?: string
    /** 应用封面图片 URL */
    cover?: string
    /** 应用初始化的 Prompt（必填） */
    initPrompt?: string
    /** 代码生成类型 */
    codeGenType?: string
    agent?: string
  }

  type AppDeployRequest = {
    /** 要部署的应用 ID */
    appId: number
  }

  type AppEditRequest = {
    /** 应用 ID */
    id: number
    /** 应用名称 */
    appName?: string
  }

  type AppQueryRequest = {
    /** 当前页号（从 1 开始） */
    pageNum?: number
    /** 每页记录数 */
    pageSize?: number
    /** 排序字段 */
    sortField?: string
    /** 排序顺序：ascend（升序）/ descend（降序），默认降序 */
    sortOrder?: string
    /** 应用 ID（精确匹配） */
    id?: number
    /** 应用名称（模糊匹配） */
    appName?: string
    /** 代码生成类型 */
    codeGenType?: string
    /** 创建用户 ID（精确匹配） */
    userId?: number
    /** 优先级（用于精选应用筛选，99为精选应用） */
    priority?: number
  }

  type AppUpdateRequest = {
    /** 应用 ID */
    id: number
    /** 应用名称 */
    appName?: string
    /** 应用封面图片 URL */
    cover?: string
    /** 优先级（用于精选推荐排序，0 为非精选） */
    priority?: number
  }

  type AppVO = {
    /** 应用 ID */
    id?: number
    /** 应用名称 */
    appName?: string
    /** 应用封面图片 URL */
    cover?: string
    /** 代码生成类型 */
    codeGenType?: string
    /** 部署标识 Key */
    deployKey?: string
    /** 部署时间 */
    deployedTime?: string
    /** 优先级（用于精选排序） */
    priority?: number
    /** 创建用户 ID */
    userId?: number
    /** 编辑时间 */
    editTime?: string
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
    user?: UserVO
  }

  type BaseResponseApp = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: App
    /** 响应消息 */
    message?: string
  }

  type BaseResponseAppVO = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: AppVO
    /** 响应消息 */
    message?: string
  }

  type BaseResponseBoolean = {
    /** 响应状态码（0 表示成功） */
    code?: number
    /** 响应数据 */
    data?: boolean
    /** 响应消息 */
    message?: string
  }

  type BaseResponseLoginUserVO = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: LoginUserVO
    /** 响应消息 */
    message?: string
  }

  type BaseResponseLong = {
    /** 响应状态码（0 表示成功） */
    code?: number
    /** 响应数据 */
    data?: number
    /** 响应消息 */
    message?: string
  }

  type BaseResponsePageApp = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: PageApp
    /** 响应消息 */
    message?: string
  }

  type BaseResponsePageAppVO = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: PageAppVO
    /** 响应消息 */
    message?: string
  }

  type BaseResponsePageChatHistory = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: PageChatHistory
    /** 响应消息 */
    message?: string
  }

  type BaseResponsePageChatHistoryVO = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: PageChatHistoryVO
    /** 响应消息 */
    message?: string
  }

  type BaseResponsePageUserVO = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: PageUserVO
    /** 响应消息 */
    message?: string
  }

  type BaseResponseString = {
    /** 响应状态码（0 表示成功） */
    code?: number
    /** 响应数据 */
    data?: string
    /** 响应消息 */
    message?: string
  }

  type BaseResponseUser = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: User
    /** 响应消息 */
    message?: string
  }

  type BaseResponseUserVO = {
    /** 响应状态码（0 表示成功） */
    code?: number
    data?: UserVO
    /** 响应消息 */
    message?: string
  }

  type ChatHistory = {
    id?: number
    message?: string
    messageType?: string
    appId?: number
    userId?: number
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type ChatHistoryQueryRequest = {
    /** 当前页号（从 1 开始） */
    pageNum?: number
    /** 每页记录数 */
    pageSize?: number
    /** 排序字段 */
    sortField?: string
    /** 排序顺序：ascend（升序）/ descend（降序），默认降序 */
    sortOrder?: string
    appId?: number
    userId?: number
    messageType?: string
  }

  type ChatHistoryVO = {
    id?: number
    message?: string
    messageType?: string
    appId?: number
    userId?: number
    user?: UserVO
    createTime?: string
  }

  type chatToGenCodeParams = {
    appId: number
    message: string
  }

  type DeleteRequest = {
    /** 要删除的记录 ID */
    id: number
  }

  type getAppByIdParams = {
    /** 应用 ID */
    id: number
  }

  type getAppVOByIdParams = {
    /** 应用 ID */
    id: number
  }

  type getUserByIdParams = {
    /** 用户 ID */
    id: number
  }

  type getUserVOByIdParams = {
    /** 用户 ID */
    id: number
  }

  type LoginUserVO = {
    /** 用户 ID */
    id?: number
    /** 账号 */
    userAccount?: string
    /** 用户昵称 */
    userName?: string
    /** 用户头像 URL */
    userAvatar?: string
    /** 用户简介 */
    userProfile?: string
    /** 用户角色：user / admin */
    userRole?: string
    /** 创建时间 */
    createTime?: string
    /** 更新时间 */
    updateTime?: string
  }

  type PageApp = {
    records?: App[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageAppVO = {
    records?: AppVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageChatHistory = {
    records?: ChatHistory[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageChatHistoryVO = {
    records?: ChatHistoryVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageUserVO = {
    records?: UserVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type previewAppParams = {
    /** 应用 ID */
    appId: number
  }

  type ServerSentEventString = true

  type User = {
    id?: number
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type UserAddRequest = {
    /** 用户昵称 */
    userName?: string
    /** 账号 */
    userAccount: string
    /** 用户头像 URL */
    userAvatar?: string
    /** 用户简介 */
    userProfile?: string
    /** 用户角色：user / admin */
    userRole?: string
  }

  type UserLoginRequest = {
    /** 账号 */
    userAccount: string
    /** 密码 */
    userPassword: string
  }

  type UserQueryRequest = {
    /** 当前页号（从 1 开始） */
    pageNum?: number
    /** 每页记录数 */
    pageSize?: number
    /** 排序字段 */
    sortField?: string
    /** 排序顺序：ascend（升序）/ descend（降序），默认降序 */
    sortOrder?: string
    /** 用户 ID（精确匹配） */
    id?: number
    /** 用户昵称（模糊匹配） */
    userName?: string
    /** 账号（模糊匹配） */
    userAccount?: string
    /** 用户简介（模糊匹配） */
    userProfile?: string
    /** 用户角色筛选：user / admin / ban */
    userRole?: string
  }

  type UserRegisterRequest = {
    /** 账号（至少 4 位） */
    userAccount: string
    /** 密码（至少 8 位） */
    userPassword: string
    /** 确认密码（需与密码一致） */
    checkPassword: string
  }

  type UserUpdateRequest = {
    /** 用户 ID */
    id: number
    /** 用户昵称 */
    userName?: string
    /** 用户头像 URL */
    userAvatar?: string
    /** 用户简介 */
    userProfile?: string
    /** 用户角色：user / admin */
    userRole?: string
  }

  type UserVO = {
    /** 用户 ID */
    id?: number
    /** 账号 */
    userAccount?: string
    /** 用户昵称 */
    userName?: string
    /** 用户头像 URL */
    userAvatar?: string
    /** 用户简介 */
    userProfile?: string
    /** 用户角色：user / admin */
    userRole?: string
    /** 创建时间 */
    createTime?: string
  }
}
