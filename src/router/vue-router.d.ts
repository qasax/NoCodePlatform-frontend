import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * 访问权限控制角色标识
     * 例如 'admin', 'user' 等
     */
    access?: string
  }
}
