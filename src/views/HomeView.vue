<template>
  <div class="home-page">
    <!-- ── HERO ─────────────────────── -->
    <section class="hero">
      <div class="hero-eyebrow">
        <span class="eyebrow-dot" />
        <span>AI 驱动 · 零代码生成平台</span>
      </div>
      <h1 class="hero-title">用对话<br /><span class="hero-hl">创造一切</span></h1>
      <p class="hero-desc">
        描述你的想法，AI 在秒级内生成完整的企业级应用。<br />
        无需代码，无需学习，无需等待。
      </p>
    </section>

    <!-- ── PROMPT INPUT ────────────── -->
    <div class="prompt-wrap">
      <div class="prompt-shell">
        <div class="prompt-icon-area">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"
            />
          </svg>
        </div>
        <input
          ref="promptInputRef"
          v-model="promptText"
          class="prompt-input"
          placeholder="描述你想创建的应用，例如：一个待办事项管理系统..."
          @keydown.enter="handleCreate"
          :disabled="isCreating"
        />
        <button
          class="prompt-send"
          :class="{ active: promptText.trim(), busy: isCreating }"
          @click="handleCreate"
          :disabled="!promptText.trim() || isCreating"
        >
          <span v-if="isCreating" class="btn-spin" />
          <template v-else>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>生成</span>
          </template>
        </button>
      </div>
      <div class="prompt-tags">
        <span class="tags-label">快速选择：</span>
        <button v-for="t in quickTags" :key="t" class="ptag" @click="fillTag(t)">{{ t }}</button>
      </div>
    </div>

    <!-- ── APP LIST ─────────────────── -->
    <div class="apps-zone">
      <!-- Tab row -->
      <div class="atz-header">
        <div class="tabs-pill">
          <button class="tab-btn" :class="{ active: activeTab === 'my' }" @click="activeTab = 'my'">
            我的应用
            <span class="tab-count">{{ myAppTotal }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'featured' }"
            @click="activeTab = 'featured'"
          >
            精选应用
            <span class="tab-count featured">{{ featuredAppTotal }}</span>
          </button>
        </div>
        <a-input-search
          v-if="activeTab === 'my'"
          v-model:value="mySearchParams.appName"
          placeholder="搜索我的应用..."
          @search="onSearchMy"
          allow-clear
          style="width: 240px"
        />
        <a-input-search
          v-else
          v-model:value="featuredSearchParams.appName"
          placeholder="搜索精选应用..."
          @search="onSearchFeatured"
          allow-clear
          style="width: 240px"
        />
      </div>

      <!-- My Apps -->
      <div v-show="activeTab === 'my'">
        <a-spin :spinning="loadingMy">
          <div v-if="myAppList.length === 0 && !loadingMy" class="empty-zone">
            <div class="empty-icon">◈</div>
            <p>还没有应用 — 在上方输入框描述你的想法开始创建吧</p>
          </div>
          <div v-else class="app-grid">
            <div v-for="item in myAppList" :key="item.id" class="app-card">
              <div class="acard-cover" @click="goDetail(item.id)">
                <img
                  :src="coverSrc(item.cover)"
                  :alt="item.appName || 'App cover'"
                  loading="lazy"
                  decoding="async"
                />
                <div class="cover-mask"><span>查看详情 →</span></div>
              </div>
              <div class="acard-body">
                <div class="acard-name">{{ item.appName }}</div>
                <span class="acard-badge">{{ item.codeGenType || 'Vue' }}</span>
              </div>
              <div class="acard-actions">
                <a-tooltip title="继续生成">
                  <button class="act-btn" @click="goGen(item.id)"><BugOutlined /></button>
                </a-tooltip>
                <a-tooltip title="编辑信息">
                  <button class="act-btn" @click="goEdit(item.id)"><EditOutlined /></button>
                </a-tooltip>
                <a-popconfirm
                  title="确定删除这个应用吗？"
                  ok-text="删除"
                  cancel-text="取消"
                  @confirm="onDeleteMy(item.id)"
                >
                  <a-tooltip title="删除">
                    <button class="act-btn danger"><DeleteOutlined /></button>
                  </a-tooltip>
                </a-popconfirm>
              </div>
            </div>
          </div>
        </a-spin>
        <a-pagination
          v-if="myAppTotal > (mySearchParams.pageSize || 8)"
          :current="mySearchParams.pageNum"
          :page-size="mySearchParams.pageSize"
          :total="myAppTotal"
          @change="onMyPageChange"
          class="page-nav"
        />
      </div>

      <!-- Featured -->
      <div v-show="activeTab === 'featured'">
        <a-spin :spinning="loadingFeatured">
          <div v-if="featuredAppList.length === 0 && !loadingFeatured" class="empty-zone">
            <div class="empty-icon">◈</div>
            <p>暂无精选应用</p>
          </div>
          <div v-else class="app-grid">
            <div
              v-for="item in featuredAppList"
              :key="item.id"
              class="app-card clickable"
              @click="goDetail(item.id)"
            >
              <div class="acard-cover">
                <img
                  :src="coverSrc(item.cover)"
                  :alt="item.appName || 'App cover'"
                  loading="lazy"
                  decoding="async"
                />
                <div class="cover-mask"><span>查看详情 →</span></div>
              </div>
              <div class="acard-body">
                <div class="acard-name">{{ item.appName }}</div>
                <span class="acard-author"
                  >by {{ item.user?.userName || item.user?.userAccount || '未知' }}</span
                >
              </div>
            </div>
          </div>
        </a-spin>
        <a-pagination
          v-if="featuredAppTotal > (featuredSearchParams.pageSize || 8)"
          :current="featuredSearchParams.pageNum"
          :page-size="featuredSearchParams.pageSize"
          :total="featuredAppTotal"
          @change="onFeaturedPageChange"
          class="page-nav"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import defaultAppCover from '@/assets/default_cover.png'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, BugOutlined } from '@ant-design/icons-vue'
import { addApp, listMyAppVoByPage, listAppVoByPage, deleteApp } from '@/api/yingyongguanli'

const router = useRouter()
const promptText = ref('')
const isCreating = ref(false)
const promptInputRef = ref<HTMLInputElement | null>(null)
const activeTab = ref('my')

const quickTags = [
  '待办事项应用',
  '个人博客系统',
  '在线商城',
  '数据看板',
  '企业 CRM',
  '问卷调查工具',
]

const coverSrc = (cover?: string) => {
  if (!cover) return defaultAppCover
  return cover
}

const fillTag = (tag: string) => {
  promptText.value = `帮我创建一个${tag}`
  promptInputRef.value?.focus()
}

const handleCreate = async () => {
  const text = promptText.value.trim()
  if (!text || isCreating.value) return
  isCreating.value = true
  try {
    const res = await addApp({
      appName: text.slice(0, 20),
      initPrompt: text,
      codeGenType: 'vue_project',
      agent: 'true',
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dr = res as any
    const appId = dr.data ?? dr
    if (appId) {
      message.success('应用创建成功，正在跳转...')
      router.push({ path: `/app/gen/${appId}`, query: { prompt: text } })
    } else {
      message.error('创建失败，请重试')
    }
  } catch (e) {
    message.error((e as Error).message || '创建失败')
  } finally {
    isCreating.value = false
  }
}

const loadingMy = ref(false)
const myAppList = ref<API.AppVO[]>([])
const myAppTotal = ref(0)
const mySearchParams = reactive<API.AppQueryRequest>({ pageNum: 1, pageSize: 8, appName: '' })

const loadMyApps = async () => {
  loadingMy.value = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await listMyAppVoByPage(mySearchParams)
    if (res) {
      myAppList.value = res.records || []
      myAppTotal.value = res.totalRow || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingMy.value = false
  }
}

const onSearchMy = () => {
  mySearchParams.pageNum = 1
  loadMyApps()
}
const onMyPageChange = (p: number) => {
  mySearchParams.pageNum = p
  loadMyApps()
}

const loadingFeatured = ref(false)
const featuredAppList = ref<API.AppVO[]>([])
const featuredAppTotal = ref(0)
const featuredSearchParams = reactive<API.AppQueryRequest>({ pageNum: 1, pageSize: 8, appName: '' })

const loadFeaturedApps = async () => {
  loadingFeatured.value = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await listAppVoByPage(featuredSearchParams)
    if (res) {
      featuredAppList.value = res.records || []
      featuredAppTotal.value = res.totalRow || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingFeatured.value = false
  }
}

const onSearchFeatured = () => {
  featuredSearchParams.pageNum = 1
  loadFeaturedApps()
}
const onFeaturedPageChange = (p: number) => {
  featuredSearchParams.pageNum = p
  loadFeaturedApps()
}

const goDetail = (id?: number) => {
  if (id) router.push(`/app/detail/${id}`)
}
const goGen = (id?: number) => {
  if (id) router.push(`/app/gen/${id}`)
}
const goEdit = (id?: number) => {
  if (id) router.push(`/app/edit/${id}`)
}
const onDeleteMy = async (id?: number) => {
  if (!id) return
  try {
    await deleteApp({ id })
    message.success('删除成功')
    loadMyApps()
  } catch {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadMyApps()
  loadFeaturedApps()
})
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 0 80px;
  animation: pageIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes pageIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Hero ── */
.hero {
  text-align: center;
  margin-bottom: 52px;
  max-width: 720px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 16px;
  border-radius: var(--r-full);
  background: rgba(79, 110, 242, 0.08);
  border: 1px solid rgba(79, 110, 242, 0.18);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--c-primary);
  letter-spacing: 0.06em;
  margin-bottom: 28px;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-primary);
  animation: blink 1.8s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

.hero-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(52px, 7vw, 80px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -3px;
  color: var(--c-text-1);
  margin: 0 0 22px;
}

.hero-hl {
  /* Glass text gradient */
  background: linear-gradient(135deg, #4f6ef2 0%, #7b8ef7 45%, #c8a96e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: 17px;
  color: var(--c-text-2);
  line-height: 1.8;
  margin: 0;
  max-width: 520px;
  margin: 0 auto;
}

/* ── Prompt ── */
.prompt-wrap {
  width: 100%;
  max-width: 720px;
  margin-bottom: 64px;
}

.prompt-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  /* Frosted glass input container */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 8px 8px 8px 18px;
  box-shadow:
    0 8px 32px rgba(79, 110, 242, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transition: all 0.22s ease;
}

.prompt-shell:focus-within {
  border-color: rgba(79, 110, 242, 0.4);
  box-shadow:
    0 12px 40px rgba(79, 110, 242, 0.12),
    0 0 0 4px rgba(79, 110, 242, 0.07),
    0 1px 4px rgba(0, 0, 0, 0.04);
}

.prompt-icon-area {
  color: var(--c-primary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.7;
}

.prompt-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15.5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: var(--c-text-1);
  padding: 10px 0;
  line-height: 1.5;
}

.prompt-input::placeholder {
  color: var(--c-text-3);
}

.prompt-send {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  border-radius: 12px;
  border: none;
  background: rgba(79, 110, 242, 0.08);
  color: var(--c-text-3);
  font-size: 14px;
  font-weight: 700;
  cursor: not-allowed;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.prompt-send.active {
  background: var(--c-primary);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(79, 110, 242, 0.3);
}

.prompt-send.active:hover {
  background: var(--c-primary-hov);
  box-shadow: 0 8px 28px rgba(79, 110, 242, 0.4);
  transform: scale(1.03);
}

.btn-spin {
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

.prompt-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding: 0 6px;
}

.tags-label {
  font-size: 12px;
  color: var(--c-text-3);
  font-weight: 500;
}

.ptag {
  padding: 5px 14px;
  border-radius: var(--r-full);
  border: 1px solid rgba(79, 110, 242, 0.14);
  background: rgba(255, 255, 255, 0.6);
  color: var(--c-text-2);
  font-size: 12.5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  transition: all 0.18s ease;
  backdrop-filter: blur(8px);
}

.ptag:hover {
  background: rgba(79, 110, 242, 0.08);
  border-color: rgba(79, 110, 242, 0.3);
  color: var(--c-primary);
}

/* ── Apps Zone ── */
.apps-zone {
  width: 100%;
  max-width: 1280px;
}

.atz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.tabs-pill {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: var(--r-md);
  padding: 4px;
  box-shadow: var(--shadow-glass);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--c-text-3);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.95);
  color: var(--c-text-1);
  box-shadow:
    0 2px 8px rgba(79, 110, 242, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.04);
}

.tab-count {
  display: inline-block;
  padding: 1px 8px;
  border-radius: var(--r-full);
  background: rgba(79, 110, 242, 0.1);
  color: var(--c-primary);
  font-size: 11.5px;
  font-weight: 700;
}

.tab-count.featured {
  background: rgba(200, 169, 110, 0.12);
  color: var(--c-accent);
}

/* ── App Grid ── */
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 18px;
}

.app-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-glass);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.app-card:hover,
.app-card.clickable:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(79, 110, 242, 0.25);
}

.app-card.clickable {
  cursor: pointer;
}

.acard-cover {
  position: relative;
  height: 156px;
  overflow: hidden;
  background: var(--c-bg-deep);
  cursor: pointer;
}

.acard-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.app-card:hover .acard-cover img {
  transform: scale(1.07);
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(12, 18, 50, 0.6), transparent 55%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 14px;
  opacity: 0;
  transition: opacity 0.28s ease;
}

.app-card:hover .cover-mask {
  opacity: 1;
}

.cover-mask span {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
}

.acard-body {
  flex: 1;
  padding: 14px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.acard-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text-1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.acard-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--r-full);
  background: rgba(79, 110, 242, 0.08);
  color: var(--c-primary);
  font-size: 11px;
  font-weight: 600;
  border: 1px solid rgba(79, 110, 242, 0.14);
  letter-spacing: 0.04em;
  align-self: flex-start;
}

.acard-author {
  font-size: 12px;
  color: var(--c-text-3);
  font-weight: 500;
}

.acard-actions {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  border-top: 1px solid rgba(79, 110, 242, 0.07);
  background: rgba(79, 110, 242, 0.02);
}

.act-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--c-text-3);
  cursor: pointer;
  transition: all 0.18s ease;
  font-size: 14px;
}

.act-btn:hover {
  background: var(--c-primary-soft);
  color: var(--c-primary);
  border-color: rgba(79, 110, 242, 0.15);
}

.act-btn.danger:hover {
  background: rgba(224, 92, 107, 0.08);
  color: var(--c-danger);
  border-color: rgba(224, 92, 107, 0.2);
}

/* Empty */
.empty-zone {
  text-align: center;
  padding: 80px 20px;
  color: var(--c-text-3);
}

.empty-icon {
  font-size: 40px;
  color: var(--c-primary);
  opacity: 0.2;
  margin-bottom: 16px;
}

.page-nav {
  margin-top: 32px;
  text-align: center;
}
</style>
