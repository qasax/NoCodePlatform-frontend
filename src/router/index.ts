import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/user/login',
      name: 'userLogin',
      component: () => import('@/views/user/UserLoginView.vue'),
    },
    {
      path: '/user/register',
      name: 'userRegister',
      component: () => import('@/views/user/UserRegisterView.vue'),
    },
    {
      path: '/admin/userManage',
      name: 'adminUserManage',
      component: () => import('@/views/admin/UserManageView.vue'),
      meta: {
        access: 'admin',
      },
    },
    {
      path: '/admin/appManage',
      name: 'adminAppManage',
      component: () => import('@/views/admin/AppManageView.vue'),
      meta: {
        access: 'admin',
      },
    },
    {
      path: '/app/gen/:appId',
      name: 'appGeneration',
      component: () => import('@/views/AppGenerationView.vue'),
    },
    {
      path: '/app/detail/:id',
      name: 'appDetail',
      component: () => import('@/views/AppDetailView.vue'),
    },
    {
      path: '/app/edit/:id',
      name: 'appEdit',
      component: () => import('@/views/AppEditView.vue'),
    },
  ],
})

// 全局路由守卫配置
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()

  // 确保拿到了最新的用户状态。
  // 通过判定如果是初始化（未执行过接口），主动触发 fetch。
  // 注意，这里的 fetch 请求只处理刚进来路由或无缓存时。
  let loginUser = loginUserStore.loginUser
  // 若为空或处于未知的“尚未初始刷新”状态才调用
  // 假如项目逻辑要求每次路由都要验身可把判断去掉，通常没必要。
  if (!loginUserStore.firstFetched) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
  }

  const toAccess = to.meta?.access as string | undefined
  // 如果当前路由需要至少管理员权限但用户并不是
  // if (toAccess === 'admin') {
  //   if (loginUser.userRole !== 'admin') {
  //     // 被拦截，推去登录页并带有跳转返回参数，或者首页
  //     next(`/user/login?redirect=${to.fullPath}`)
  //     return
  //   }
  // }

  // 其他必须登录才能访问的逻辑 (此示例暂不强制，可扩展 `access: 'user'`)
  if (toAccess === 'user' && loginUser.userRole === 'guest') {
    next(`/user/login?redirect=${to.fullPath}`)
    return
  }

  next()
})

export default router
