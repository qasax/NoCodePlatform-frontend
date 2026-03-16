<template>
  <div class="mgr-page">
    <!-- Top -->
    <div class="mgr-top">
      <div class="mgr-top-l">
        <h1 class="mgr-title">应用管理</h1>
        <span class="total-pill">共 {{ total }} 个</span>
      </div>
      <button class="create-btn" @click="openModal('add')"><PlusOutlined />&nbsp;新建应用</button>
    </div>

    <!-- Search -->
    <div class="search-glass">
      <a-input
        v-model:value="searchParams.appName"
        placeholder="搜索应用名称..."
        allow-clear
        style="flex: 1; min-width: 180px; max-width: 300px"
        @press-enter="handleSearch"
      >
        <template #prefix><SearchOutlined style="color: var(--c-text-3)" /></template>
      </a-input>
      <a-select
        v-model:value="searchParams.codeGenType"
        placeholder="生成类型"
        allow-clear
        style="width: 140px"
      >
        <a-select-option value="vue_project">Vue 项目</a-select-option>
        <a-select-option value="html">HTML</a-select-option>
      </a-select>
      <button class="sg-btn primary" @click="handleSearch" :disabled="loading">
        <SearchOutlined /> 搜索
      </button>
      <button class="sg-btn" @click="resetSearch">重置</button>
    </div>

    <!-- Table -->
    <div class="table-glass">
      <a-table
        :columns="columns"
        :data-source="dataList"
        :row-key="(r: API.AppVO) => r.id"
        :pagination="{
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
        }"
        :loading="loading"
        @change="handleTableChange"
        :scroll="{ x: 'max-content' }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'cover'">
            <div class="cover-ch">
              <img
                :src="coverSrc(record.cover)"
                :alt="record.appName || 'App cover'"
                loading="lazy"
                decoding="async"
              />
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'appName'">
            <span class="tbl-name">{{ record.appName }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'codeGenType'">
            <span class="tbl-badge">{{ record.codeGenType || '—' }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="act-group">
              <button class="tbl-btn" @click="router.push(`/app/detail/${record.id}`)">查看</button>
              <button class="tbl-btn" @click="router.push(`/app/edit/${record.id}`)">编辑</button>
              <a-popconfirm
                title="确定要设为精选吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleSetFeatured(record.id)"
              >
                <button class="tbl-btn gold">精选</button>
              </a-popconfirm>
              <a-popconfirm
                title="确定要删除该应用吗？"
                ok-text="删除"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <button class="tbl-btn danger">删除</button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalType === 'add' ? '新建应用' : '编辑应用'"
      @ok="handleModalOk"
      :confirmLoading="submitLoading"
      destroyOnClose
      :width="520"
    >
      <a-form :model="formState" layout="vertical" ref="modalFormRef">
        <a-form-item name="id" label="ID" v-if="modalType === 'edit'">
          <a-input v-model:value="formState.id" disabled />
        </a-form-item>
        <a-form-item
          name="appName"
          label="应用名称"
          :rules="[{ required: true, message: '请输入应用名称' }]"
        >
          <a-input v-model:value="formState.appName" placeholder="请输入应用名称" />
        </a-form-item>
        <a-form-item name="cover" label="封面地址">
          <a-input v-model:value="formState.cover" placeholder="请输入封面URL地址" />
        </a-form-item>
        <a-form-item name="initPrompt" label="初始化提示词" v-if="modalType === 'add'">
          <a-textarea
            v-model:value="formState.initPrompt"
            :rows="4"
            placeholder="请输入初始化提示词"
          />
        </a-form-item>
        <a-form-item name="priority" label="优先级" v-if="modalType === 'edit'">
          <a-input-number v-model:value="formState.priority" style="width: 100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import defaultAppCover from '@/assets/default_cover.png'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { listMyAppVoByPage, addApp, updateApp, deleteApp } from '@/api/yingyongguanli'
import type { TableProps } from 'ant-design-vue'

const router = useRouter()
const loading = ref(false)
const dataList = ref<API.AppVO[]>([])
const total = ref(0)
const searchParams = reactive<API.AppQueryRequest>({
  pageNum: 1,
  pageSize: 10,
  appName: '',
  codeGenType: undefined,
})

const coverSrc = (c?: string) => {
  if (!c) return defaultAppCover
  return c
}

const columns = [
  { title: '封面', dataIndex: 'cover', width: 70 },
  { title: '应用名称', dataIndex: 'appName', width: 200 },
  { title: '类型', dataIndex: 'codeGenType', width: 120 },
  { title: '优先级', dataIndex: 'priority', width: 80 },
  { title: 'ID', dataIndex: 'id', width: 120 },
  { title: '创建时间', dataIndex: 'createTime', width: 175 },
  { title: '操作', key: 'action', width: 230, fixed: 'right' as const },
]

const loadData = async () => {
  loading.value = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await listMyAppVoByPage(searchParams)
    if (res) {
      dataList.value = res.records || []
      total.value = res.totalRow || 0
    }
  } catch {
    message.error('加载应用列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchParams.pageNum = 1
  loadData()
}
const resetSearch = () => {
  searchParams.appName = ''
  searchParams.codeGenType = undefined
  searchParams.pageNum = 1
  loadData()
}
const handleTableChange: TableProps['onChange'] = (p) => {
  searchParams.pageNum = p.current || 1
  searchParams.pageSize = p.pageSize || 10
  loadData()
}
const handleDelete = async (id?: number) => {
  if (!id) return
  try {
    await deleteApp({ id })
    message.success('删除成功')
    loadData()
  } catch (e) {
    message.error((e as Error).message || '删除失败')
  }
}
const handleSetFeatured = async (id?: number) => {
  if (!id) return
  try {
    await updateApp({ id, priority: 99 })
    message.success('设置精选成功')
    loadData()
  } catch (e) {
    message.error((e as Error).message || '设置失败')
  }
}

const modalVisible = ref(false)
const submitLoading = ref(false)
const modalType = ref<'add' | 'edit'>('add')
const modalFormRef = ref()
const formState = reactive({
  id: undefined as number | undefined,
  appName: '',
  cover: '',
  initPrompt: '',
  priority: 0 as number | undefined,
})

const openModal = (type: 'add' | 'edit', record?: API.AppVO) => {
  modalType.value = type
  if (type === 'add')
    Object.assign(formState, {
      id: undefined,
      appName: '',
      cover: '',
      initPrompt: '',
      priority: undefined,
    })
  else if (record)
    Object.assign(formState, {
      id: record.id,
      appName: record.appName || '',
      cover: record.cover || '',
      priority: record.priority,
    })
  modalVisible.value = true
}

const handleModalOk = async () => {
  try {
    await modalFormRef.value?.validate()
    submitLoading.value = true
    if (modalType.value === 'add') {
      await addApp({
        appName: formState.appName,
        cover: formState.cover,
        initPrompt: formState.initPrompt,
      })
      message.success('新建应用成功')
    } else {
      await updateApp({
        id: formState.id as number,
        appName: formState.appName,
        cover: formState.cover,
        priority: formState.priority,
      })
      message.success('更新成功')
    }
    modalVisible.value = false
    loadData()
  } catch (e) {
    if ((e as Error).message) message.error((e as Error).message)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.mgr-page {
  padding-bottom: 40px;
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

.mgr-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.mgr-top-l {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.mgr-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 24px;
  font-weight: 800;
  color: var(--c-text-1);
  margin: 0;
}
.total-pill {
  font-size: 12.5px;
  color: var(--c-text-3);
  background: rgba(79, 110, 242, 0.08);
  border: 1px solid rgba(79, 110, 242, 0.14);
  padding: 3px 14px;
  border-radius: var(--r-full);
  font-weight: 600;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--r-md);
  border: none;
  background: var(--c-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
  font-family: 'Plus Jakarta Sans', sans-serif;
  box-shadow: var(--shadow-btn);
}
.create-btn:hover {
  background: var(--c-primary-hov);
  box-shadow: 0 6px 22px rgba(79, 110, 242, 0.4);
  transform: translateY(-1px);
}

/* Search bar */
.search-glass {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1.5px solid rgba(255, 255, 255, 0.88);
  border-radius: var(--r-lg);
  padding: 14px 20px;
  margin-bottom: 18px;
  box-shadow: var(--shadow-glass);
}

.sg-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border-radius: var(--r-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(79, 110, 242, 0.14);
  color: var(--c-text-2);
}
.sg-btn.primary {
  background: var(--c-primary);
  border: none;
  color: #fff;
  box-shadow: var(--shadow-btn);
}
.sg-btn.primary:hover:not(:disabled) {
  background: var(--c-primary-hov);
}
.sg-btn:not(.primary):hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
}

/* Table */
.table-glass {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1.5px solid rgba(255, 255, 255, 0.88);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-glass);
  overflow: hidden;
}

.cover-ch {
  width: 48px;
  height: 36px;
  border-radius: 7px;
  overflow: hidden;
  background: var(--c-bg-deep);
}
.cover-ch img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tbl-name {
  font-weight: 600;
  color: var(--c-text-1);
}

.tbl-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--r-full);
  background: rgba(79, 110, 242, 0.08);
  color: var(--c-primary);
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid rgba(79, 110, 242, 0.14);
}

.act-group {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.tbl-btn {
  padding: 4px 12px;
  border-radius: var(--r-xs);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid rgba(79, 110, 242, 0.12);
  background: rgba(79, 110, 242, 0.04);
  color: var(--c-text-2);
  transition: all 0.15s ease;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.tbl-btn:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
  background: var(--c-primary-soft);
}
.tbl-btn.gold {
  border-color: rgba(200, 169, 110, 0.25);
  color: var(--c-accent);
  background: rgba(200, 169, 110, 0.06);
}
.tbl-btn.gold:hover {
  background: rgba(200, 169, 110, 0.12);
}
.tbl-btn.danger {
  border-color: rgba(224, 92, 107, 0.2);
  color: var(--c-danger);
  background: rgba(224, 92, 107, 0.04);
}
.tbl-btn.danger:hover {
  background: rgba(224, 92, 107, 0.1);
}

/* 移除输入框边框 */
.search-glass :deep(.ant-input) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
.search-glass :deep(.ant-input:focus) {
  border: none !important;
  box-shadow: none !important;
}
:deep(.ant-input-number) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
:deep(.ant-input-number:focus) {
  border: none !important;
  box-shadow: none !important;
}
:deep(.ant-textarea) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
:deep(.ant-textarea:focus) {
  border: none !important;
  box-shadow: none !important;
}
</style>