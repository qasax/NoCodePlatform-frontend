# AI 零代码平台前端 (NoCodePlatform-frontend)

## 1. 项目概览与目标

**AI 零代码平台**旨在为企业提供一个高效、直观的无代码开发平台。当前前端应用主要负责与后端的 API 交互，为不同角色的用户提供可视化操作界面。

**当前已实现阶段性目标**：

- 完成前端工程的搭建及基础架构整合，同时重构了现代化的组件 UI 及全局流体拟物样式。
- 整合了后端 API 自动打通能力（借助 `openapi2ts`）。
- 建立并完备了系统的**用户模块与权限控制**（包含状态保持、全局 `Router` 路由守卫鉴权、Axios 响应阻断、及管理员专用的后台管理）。

## 2. 技术栈结构

项目遵循现代化的 Vue 前端开发规范，关键选型及相关约定如下：

- **核心框架**：Vue 3 (基于组合式 API `Composition API` 语法编写)
- **构建工具**：Vite
- **UI 组件库**：Ant Design Vue (用于快速构建美观、体验一致的基础界面和后台面板)
- **路由管理**：Vue Router (承载平台所有页面的路由导航，含登录过滤和后台拦截逻辑)
- **状态管理**：Pinia (创建了 `useLoginUserStore.ts` 服务于全局保存和同步 `loginUser` 状态)
- **网络请求**：Axios (封装了通用的 `request.ts`，配置了对应拦截器处理通用业务逻辑及错误回显)
- **API 接口生成**：`@umijs/openapi` (通过运行 `npm run openapi2ts` 直接拉取后端的接口文档，自动转换出对应 TS 声明与 Request 方法)

## 3. 核心目录与结构职责

```text
/src
 ├── api/               # [自动生成] 由 openapi2ts 抓取后端 swagger 自动生成的全量接口服务与 TS 类型定义 (typings.d.ts)
 ├── assets/            # 静态资源 (图片、基础样式等)
 ├── components/        # 公共组件 (例如 GlobalHeader, GlobalFooter 等全局复用的碎片化组件)
 ├── layouts/           # 页面布局模板
 │    ├── BasicLayout.vue # 包含全局头尾的通用主内容布局
 │    └── UserLayout.vue  # 专供登录、注册用的通栏沉浸式卡片布局
 ├── router/            # 页面路由注册及基础拦截处理 (index.ts)
 ├── stores/            # Pinia 数据仓库 (包含存放用户凭证和基本信息的 useLoginUserStore)
 ├── views/             # 核心视图页面
 │    ├── admin/        # 管理员专属页面目录
 │    │    └── UserManageView.vue # [已完成] 具备完整 CRUD 功能与搜索过滤的用户管理后台
 │    ├── user/         # 普通用户鉴权页面
 │    │    ├── UserLoginView.vue    # 用户登录页
 │    │    └── UserRegisterView.vue # 用户注册页
 │    ├── AboutView.vue
 │    └── HomeView.vue
 ├── App.vue            # 根组件，动态控制挂载的 Layout 层
 ├── main.ts            # 全局 Vue 实例化及扩展库 (Pinia, Router, Antd) 的挂载入口
 └── request.ts         # Axios 实例的自定义封装 (含业务层 code 异常捕捉)
```

## 4. MCP 与自动化能力应用

在最近的开发与测试环节中，项目开发过程深度融合了辅助 Agent 提供的能力与 MCP (Model Context Protocol) 标准支持：

- **Playwright MCP Server (`@playwright/mcp`)**：
  - **核心应用**：用于在开发过程中，直接通过无头浏览器唤起页面进行真实的**自动化端到端 (E2E) 验收测试**。
  - **实践场景**：通过 Playwright MCP，AI Agent 自主定位页面元素坐标/ DOM 节点，填写账号密码完成了注册、登录；验证了前端路由能否按预期将非 Admin 用户拦截出后台界面；乃至临时赋权后验证了管理表格能否渲染和正常触发查询请求。极大减少了开发期间人工点击流测试的繁琐。
- **Browser Subagent**：
  - 基于 Chromium 进行视觉捕获并模拟基于视觉/坐标等用户动作，自动发现 CORS (跨域) 等网络通信配置错误并配合快速排查解决。

## 5. 后续计划

接下来，在基础账号与鉴权系统铺垫完成且验证稳定的基础上，平台将进一步步入最核心的**智能**与**无代码**业务逻辑的开发流程。这可能包括：

1. **工作区/应用管理模块**：允许用户创建属于自己的应用项目。
2. **可视化搭建核心面板**：引入拖拽引擎或页面渲染解析树。
3. **AI 对话式辅助设计**：允许用户接入 AI 对话完成快速的应用骨架生成或逻辑辅助。
