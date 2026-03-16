<template>
  <header class="g-header">
    <div class="h-inner">
      <!-- Logo -->
      <div class="h-logo" @click="router.push('/')">
        <div class="h-logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
            <path
              d="M2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <span class="h-logo-text">NoCode<em>AI</em></span>
      </div>

      <!-- Nav -->
      <nav class="h-nav">
        <a
          v-for="item in navItems"
          :key="item.key"
          class="h-nav-link"
          :class="{ 'is-active': selectedKeys.includes(item.key) }"
          @click="handleNav(item.key)"
          v-show="!item.adminOnly || loginUserStore.loginUser?.userRole === 'admin'"
          >{{ item.label }}</a
        >
      </nav>

      <!-- Right -->
      <div class="h-right">
        <template v-if="loginUserStore.loginUser?.id">
          <a-dropdown placement="bottomRight">
            <div class="h-user">
              <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="28">
                {{ (loginUserStore.loginUser.userName || 'U')[0] }}
              </a-avatar>
              <span class="h-username">{{ loginUserStore.loginUser.userName }}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <span style="color: var(--c-danger)">退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <template v-else>
          <button class="h-login-btn" @click="router.push('/user/login')">登录</button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogout } from '@/api/yonghuguanli'
import { message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()
const selectedKeys = ref<string[]>(['home'])

const navItems = [
  { key: 'home', label: '首页' },
  { key: 'apps', label: '关于' },
  { key: 'adminUser', label: '用户管理', adminOnly: true },
  { key: 'adminApp', label: '应用管理' },
]

watchEffect(() => {
  if (route.path === '/') selectedKeys.value = ['home']
  else if (route.path === '/about') selectedKeys.value = ['apps']
  else if (route.path.startsWith('/admin/userManage')) selectedKeys.value = ['adminUser']
  else if (route.path.startsWith('/admin/appManage')) selectedKeys.value = ['adminApp']
  else selectedKeys.value = []
})

const handleNav = (key: string) => {
  const routes: Record<string, string> = {
    home: '/',
    apps: '/about',
    adminUser: '/admin/userManage',
    adminApp: '/admin/appManage',
  }
  if (routes[key]) router.push(routes[key])
}

const handleLogout = async () => {
  try {
    await userLogout()
    message.success('已退出登录')
    await loginUserStore.fetchLoginUser()
    router.push('/user/login')
  } catch (error) {
    message.error((error as Error).message || '退出失败')
  }
}
</script>

<style scoped>
.g-header {
  height: 100%;
  /* Perfect glass bar */
  background: rgba(238, 240, 246, 0.72);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 1px 0 rgba(79, 110, 242, 0.08),
    0 4px 24px rgba(79, 110, 242, 0.04);
}

.h-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

/* Logo */
.h-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
}

.h-logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f6ef2 0%, #7b8ef7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(79, 110, 242, 0.3);
}

.h-logo-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 17px;
  font-weight: 800;
  color: var(--c-text-1);
  letter-spacing: -0.3px;
}

.h-logo-text em {
  font-style: normal;
  color: var(--c-primary);
}

/* Nav */
.h-nav {
  display: flex;
  align-items: center;
  gap: 1px;
  margin-left: 24px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  white-space: nowrap;
}

.h-nav::-webkit-scrollbar {
  display: none;
}

.h-nav-link {
  padding: 6px 12px;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-2);
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1px solid transparent;
  text-decoration: none;
  user-select: none;
  flex-shrink: 0;
}

.h-nav-link:hover {
  color: var(--c-primary);
  background: var(--c-primary-soft);
}

.h-nav-link.is-active {
  color: var(--c-primary);
  background: var(--c-primary-soft);
  border-color: rgba(79, 110, 242, 0.18);
  font-weight: 600;
}

/* Right */
.h-right {
  flex-shrink: 0;
}

.h-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-2);
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1px solid transparent;
  user-select: none;
  height: 36px;
}

.h-user:hover {
  color: var(--c-primary);
  background: var(--c-primary-soft);
  border-color: rgba(79, 110, 242, 0.18);
}

.h-username {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text-2);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: 0.02em;
}

.h-login-btn {
  padding: 6px 16px;
  border-radius: var(--r-full);
  border: none;
  background: var(--c-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Plus Jakarta Sans', sans-serif;
  box-shadow:
    0 1px 0 rgba(79, 110, 242, 0.08),
    0 2px 8px rgba(79, 110, 242, 0.04);
  letter-spacing: 0.02em;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.h-login-btn:hover {
  background: var(--c-primary-hov);
  box-shadow:
    0 1px 0 rgba(79, 110, 242, 0.12),
    0 4px 12px rgba(79, 110, 242, 0.08);
  transform: translateY(-1px);
}
</style>
