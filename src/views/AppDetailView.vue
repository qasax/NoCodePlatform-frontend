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
      <h1 class="ph-title">应用详情</h1>
    </div>

    <a-spin :spinning="loading">
      <div v-if="appData" class="detail-glass">
        <!-- Banner -->
        <div class="dg-banner">
          <img :src="coverSrc(appData.cover)" alt="cover" />
          <div class="dg-banner-mask" />
          <div class="dg-banner-info">
            <div class="dg-app-name">{{ appData.appName }}</div>
            <div class="dg-deploy-tag" v-if="appData.deployKey"><span class="dp-dot" />已部署</div>
          </div>
        </div>
        <!-- Fields -->
        <div class="dg-fields">
          <div class="dg-row" v-for="f in fields" :key="f.label">
            <div class="dg-label">{{ f.label }}</div>
            <div class="dg-val">
              <template v-if="f.key === 'user'">
                <div v-if="appData.user" class="creator-row">
                  <a-avatar :src="appData.user.userAvatar" :size="22">{{
                    (appData.user.userName || 'U')[0]
                  }}</a-avatar>
                  <span>{{ appData.user.userName || appData.user.userAccount }}</span>
                </div>
                <span v-else class="val-empty">无</span>
              </template>
              <span v-else-if="!fieldVal(f.key as keyof API.AppVO)" class="val-empty">—</span>
              <span v-else>{{ fieldVal(f.key as keyof API.AppVO) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="empty-state">
        <div class="ei">◈</div>
        <p>未找到应用信息</p>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import defaultAppCover from '@/assets/default_cover.png'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getAppVoById } from '@/api/yingyongguanli'

const route = useRoute()
const router = useRouter()
const appId = route.params.id as string
const loading = ref(false)
const appData = ref<API.AppVO | null>(null)

const coverSrc = (c?: string) => {
  if (!c) return defaultAppCover
  return c
}

const fields = [
  { label: '应用 ID', key: 'id' },
  { label: '应用名称', key: 'appName' },
  { label: '生成类型', key: 'codeGenType' },
  { label: '部署标识', key: 'deployKey' },
  { label: '优先级', key: 'priority' },
  { label: '创建时间', key: 'createTime' },
  { label: '更新时间', key: 'updateTime' },
  { label: '创建者', key: 'user' },
]

const fieldVal = (key: keyof API.AppVO) => {
  if (!appData.value) return ''
  if (key === 'deployKey') return appData.value[key] || '暂未部署'
  return appData.value[key] as string | number | undefined
}

onMounted(async () => {
  if (!appId) return
  loading.value = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await getAppVoById({ id: appId as any })
    appData.value = res?.data || res
  } catch {
    message.error('获取应用详情失败')
  } finally {
    loading.value = false
  }
})

const goBack = () => router.back()
</script>

<style scoped>
.page-wrap {
  max-width: 860px;
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

.detail-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(150%);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--r-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.dg-banner {
  position: relative;
  height: 240px;
  background: var(--c-bg-deep);
}
.dg-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dg-banner-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(12, 18, 50, 0.75) 0%,
    rgba(12, 18, 50, 0.2) 50%,
    transparent 100%
  );
}
.dg-banner-info {
  position: absolute;
  bottom: 22px;
  left: 28px;
  right: 28px;
}
.dg-app-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 10px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}
.dg-deploy-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: var(--r-full);
  background: rgba(61, 189, 135, 0.18);
  border: 1px solid rgba(61, 189, 135, 0.3);
  font-size: 12px;
  color: var(--c-success);
  font-weight: 600;
}
.dp-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-success);
  box-shadow: 0 0 6px var(--c-success);
}

.dg-fields {
  padding: 4px 0;
}
.dg-row {
  display: flex;
  align-items: flex-start;
  padding: 14px 28px;
  border-bottom: 1px solid rgba(79, 110, 242, 0.06);
  transition: background 0.15s;
}
.dg-row:last-child {
  border-bottom: none;
}
.dg-row:hover {
  background: rgba(79, 110, 242, 0.025);
}
.dg-label {
  width: 110px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-3);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding-top: 2px;
}
.dg-val {
  flex: 1;
  font-size: 14px;
  color: var(--c-text-1);
  word-break: break-all;
}
.val-empty {
  color: var(--c-text-3);
}
.creator-row {
  display: flex;
  align-items: center;
  gap: 10px;
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
