<template>
  <div class="auth-card">
    <div class="ac-header">
      <h2 class="ac-title">欢迎回来</h2>
      <p class="ac-sub">登录你的 NoCode AI 账号</p>
    </div>

    <a-form :model="loginForm" @finish="handleLogin" layout="vertical" class="ac-form">
      <a-form-item
        name="userAccount"
        label="账号"
        :rules="[{ required: true, message: '请输入账号' }]"
      >
        <a-input v-model:value="loginForm.userAccount" placeholder="请输入账号" size="large">
          <template #prefix><UserOutlined /></template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="userPassword"
        label="密码"
        :rules="[{ required: true, message: '请输入密码' }]"
      >
        <a-input-password
          v-model:value="loginForm.userPassword"
          placeholder="请输入密码"
          size="large"
        >
          <template #prefix><LockOutlined /></template>
        </a-input-password>
      </a-form-item>

      <a-form-item style="margin-bottom: 12px">
        <button type="submit" class="ac-submit" :class="{ loading }" :disabled="loading">
          <span v-if="loading" class="ac-spinner" />
          <template v-else>登 录</template>
        </button>
      </a-form-item>
    </a-form>

    <div class="ac-footer">
      <span>还没有账号？</span>
      <router-link to="/user/register" class="ac-link">立即注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { userLogin } from '@/api/yonghuguanli'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const loginForm = reactive({ userAccount: '', userPassword: '' })
const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()
const loading = ref(false)

const handleLogin = async (values: API.UserLoginRequest) => {
  try {
    loading.value = true
    const res = await userLogin(values)
    if (res) {
      message.success('登录成功')
      await loginUserStore.fetchLoginUser()
      router.replace({ path: (route.query.redirect as string) || '/' })
    }
  } catch (error) {
    message.error((error as Error).message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  border-radius: var(--r-xl);
  box-shadow:
    0 24px 64px rgba(79, 110, 242, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 36px 36px 28px;
  animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ac-header {
  text-align: center;
  margin-bottom: 28px;
}

.ac-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: var(--c-text-1);
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.ac-sub {
  font-size: 14px;
  color: var(--c-text-3);
  margin: 0;
}

.ac-form :deep(.ant-form-item-label label) {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-2) !important;
}

.ac-form :deep(.ant-input-affix-wrapper) {
  background: rgba(255, 255, 255, 0.85) !important;
  border-color: rgba(79, 110, 242, 0.15) !important;
}
.ac-form :deep(.ant-input-affix-wrapper:focus),
.ac-form :deep(.ant-input-affix-wrapper-focused) {
  border-color: var(--c-primary) !important;
  box-shadow: 0 0 0 3px rgba(79, 110, 242, 0.12) !important;
}

/* 移除内层输入框的边框，只保留外层包裹器边框 */
.ac-form :deep(.ant-input) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
.ac-form :deep(.ant-input:focus) {
  border: none !important;
  box-shadow: none !important;
}

.ac-submit {
  width: 100%;
  padding: 13px;
  border-radius: var(--r-md);
  border: none;
  background: var(--c-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
  font-family: 'Plus Jakarta Sans', sans-serif;
  box-shadow: var(--shadow-btn);
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ac-submit:hover:not(:disabled) {
  background: var(--c-primary-hov);
  box-shadow: 0 8px 28px rgba(79, 110, 242, 0.4);
  transform: translateY(-1px);
}

.ac-submit:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.ac-spinner {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ac-footer {
  text-align: center;
  font-size: 13.5px;
  color: var(--c-text-3);
  margin-top: 20px;
}

.ac-link {
  color: var(--c-primary);
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
  transition: opacity 0.2s;
}

.ac-link:hover {
  opacity: 0.75;
}
</style>
