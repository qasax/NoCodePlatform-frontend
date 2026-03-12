<template>
  <div class="page-wrap">
    <div class="page-head">
      <button class="nav-back" @click="goBack">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        返回
      </button>
      <h1 class="ph-title">编辑应用</h1>
    </div>

    <a-spin :spinning="loading">
      <div v-if="formState.id" class="edit-glass">
        <a-form :model="formState" layout="vertical" @finish="handleSave" class="ef">
          <a-form-item
            name="appName"
            label="应用名称"
            :rules="[{ required: true, message: '请输入应用名称' }]"
          >
            <a-input v-model:value="formState.appName" placeholder="请输入应用名称" size="large" />
          </a-form-item>
          <template v-if="isAdmin">
            <a-form-item name="cover" label="封面图片 URL">
              <a-input
                v-model:value="formState.cover"
                placeholder="请输入封面URL地址"
                size="large"
              />
            </a-form-item>
            <a-form-item name="priority" label="优先级">
              <a-input-number v-model:value="formState.priority" style="width: 100%" size="large" />
              <div class="help-txt">优先级大于 0 时将出现在精选列表</div>
            </a-form-item>
          </template>
          <a-form-item style="margin-top: 8px; margin-bottom: 0">
            <button type="submit" class="save-btn" :disabled="submitLoading">
              <span v-if="submitLoading" class="spin" />
              <template v-else>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                保存修改
              </template>
            </button>
          </a-form-item>
        </a-form>
      </div>
      <div v-else-if="!loading" class="empty-state">
        <div class="ei">◈</div>
        <p>未加载到应用数据</p>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAppVoById, editApp, updateApp } from '@/api/yingyongguanli'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const route = useRoute()
const router = useRouter()
const appId = route.params.id as string
const loginUserStore = useLoginUserStore()
const isAdmin = computed(() => loginUserStore.loginUser?.userRole === 'admin')
const loading = ref(false)
const submitLoading = ref(false)
const formState = reactive({
  id: undefined as number | string | undefined,
  appName: '',
  cover: '',
  priority: 0 as number | undefined,
})

onMounted(async () => {
  if (!appId) return
  loading.value = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await getAppVoById({ id: appId as any })
    const d = res?.data || res
    Object.assign(formState, {
      id: d.id,
      appName: d.appName || '',
      cover: d.cover || '',
      priority: d.priority || 0,
    })
  } catch {
    message.error('获取应用信息失败')
  } finally {
    loading.value = false
  }
})

const goBack = () => router.back()

const handleSave = async () => {
  if (!formState.id) return
  submitLoading.value = true
  try {
    if (isAdmin.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateApp({
        id: formState.id as any,
        appName: formState.appName,
        cover: formState.cover,
        priority: formState.priority,
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await editApp({ id: formState.id as any, appName: formState.appName })
    }
    message.success('修改成功')
    router.back()
  } catch (e: unknown) {
    message.error((e as Error).message || '保存失败')
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.page-wrap {
  max-width: 580px;
  margin: 0 auto;
  padding-bottom: 60px;
  animation: fadeUp 0.4s ease both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.page-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.nav-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: var(--r-sm);
  border: 1px solid rgba(79, 110, 242, 0.15);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  color: var(--c-text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.nav-back:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
}
.ph-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: var(--c-text-1);
  margin: 0;
}

.edit-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(150%);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-glass);
  padding: 36px;
}

.ef :deep(.ant-form-item-label label) {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-2) !important;
}
.help-txt {
  margin-top: 6px;
  font-size: 12px;
  color: var(--c-text-3);
}

.save-btn {
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
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.save-btn:hover:not(:disabled) {
  background: var(--c-primary-hov);
  box-shadow: 0 8px 28px rgba(79, 110, 242, 0.4);
  transform: translateY(-1px);
}
.save-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
.spin {
  display: block;
  width: 16px;
  height: 16px;
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

.empty-state {
  text-align: center;
  padding: 80px;
  color: var(--c-text-3);
}
.ei {
  font-size: 36px;
  color: var(--c-primary);
  opacity: 0.2;
  margin-bottom: 12px;
}
</style>
