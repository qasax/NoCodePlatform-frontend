<template>
  <div class="user-manage-container">
    <a-card title="用户管理">
      <!-- 搜索表单 -->
      <a-form layout="inline" :model="searchParams" @finish="handleSearch" class="search-form">
        <a-form-item name="userAccount" label="账号">
          <a-input v-model:value="searchParams.userAccount" placeholder="请输入账号" allow-clear />
        </a-form-item>
        <a-form-item name="userName" label="昵称">
          <a-input v-model:value="searchParams.userName" placeholder="请输入昵称" allow-clear />
        </a-form-item>
        <a-form-item name="userRole" label="角色">
          <a-select
            v-model:value="searchParams.userRole"
            placeholder="请选择角色"
            allow-clear
            style="width: 120px"
          >
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading">搜索</a-button>
          <a-button style="margin-left: 8px" @click="resetSearch">重置</a-button>
        </a-form-item>
      </a-form>

      <!-- 操作栏 -->
      <div class="table-operations">
        <a-button type="primary" @click="openModal('add')">
          <template #icon><PlusOutlined /></template>
          新建用户
        </a-button>
      </div>

      <!-- 数据表格 -->
      <a-table
        :columns="columns"
        :data-source="dataList"
        :row-key="(record: API.UserVO) => record.id"
        :pagination="{
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
          total: total,
          showSizeChanger: true,
          showTotal: (total: number) => `共 ${total} 条`,
        }"
        :loading="loading"
        @change="handleTableChange"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userAvatar'">
            <a-avatar :src="record.userAvatar" v-if="record.userAvatar" />
            <a-avatar v-else><UserOutlined /></a-avatar>
          </template>
          <template v-else-if="column.dataIndex === 'userRole'">
            <a-tag :color="record.userRole === 'admin' ? 'blue' : 'default'">
              {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="openModal('edit', record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定要删除该用户吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record.id)"
            >
              <a class="danger-text">删除</a>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalType === 'add' ? '新建用户' : '编辑用户'"
      @ok="handleModalOk"
      :confirmLoading="submitLoading"
      destroyOnClose
    >
      <a-form
        :model="formState"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
        ref="modalFormRef"
      >
        <a-form-item
          name="userAccount"
          label="账号"
          :rules="modalType === 'add' ? [{ required: true, message: '请输入账号' }] : []"
        >
          <a-input
            v-model:value="formState.userAccount"
            placeholder="请输入账号"
            :disabled="modalType === 'edit'"
          />
        </a-form-item>
        <a-form-item
          name="userPassword"
          label="密码"
          :rules="[{ required: true, message: '请输入至少8位密码' }]"
          v-if="modalType === 'add'"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入至少8位密码"
          />
        </a-form-item>
        <a-form-item name="userName" label="昵称">
          <a-input v-model:value="formState.userName" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item name="userAvatar" label="头像">
          <a-input v-model:value="formState.userAvatar" placeholder="请输入头像URL地址" />
        </a-form-item>
        <a-form-item name="userProfile" label="简介">
          <a-textarea v-model:value="formState.userProfile" placeholder="请输入简介" :rows="2" />
        </a-form-item>
        <a-form-item
          name="userRole"
          label="角色"
          :rules="[{ required: true, message: '请选择角色' }]"
        >
          <a-select v-model:value="formState.userRole" placeholder="请选择角色">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, UserOutlined } from '@ant-design/icons-vue'
import { listUserVoByPage, updateUser, deleteUser, userRegister } from '@/api/yonghuguanli'
import type { TableProps } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 权限检查
if (loginUserStore.loginUser?.userRole !== 'admin') {
  message.error('无权限访问')
  router.push('/')
}

const loading = ref(false)
const dataList = ref<API.UserVO[]>([])
const total = ref(0)
const searchParams = reactive<API.UserQueryRequest>({
  pageNum: 1,
  pageSize: 10,
  userAccount: '',
  userName: '',
  userRole: undefined,
})

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '头像', dataIndex: 'userAvatar', width: 80 },
  { title: '账号', dataIndex: 'userAccount', width: 120 },
  { title: '昵称', dataIndex: 'userName', width: 150 },
  { title: '角色', dataIndex: 'userRole', width: 100 },
  { title: '简介', dataIndex: 'userProfile', ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' as const },
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await listUserVoByPage(searchParams)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = res as any
    if (data) {
      dataList.value = data.records || []
      total.value = data.totalRow || 0
    }
  } catch {
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchParams.pageNum = 1
  loadData()
}

// 重置
const resetSearch = () => {
  searchParams.userAccount = ''
  searchParams.userName = ''
  searchParams.userRole = undefined
  searchParams.pageNum = 1
  loadData()
}

// 分页变化
const handleTableChange: TableProps['onChange'] = (pagination) => {
  searchParams.pageNum = pagination.current || 1
  searchParams.pageSize = pagination.pageSize || 10
  loadData()
}

// 删除
const handleDelete = async (id?: number) => {
  if (!id) return
  try {
    const res = await deleteUser({ id })
    if (res) {
      message.success('删除成功')
      loadData()
    }
  } catch (error) {
    message.error((error as Error).message || '删除失败')
  }
}

// 弹窗逻辑
const modalVisible = ref(false)
const submitLoading = ref(false)
const modalType = ref<'add' | 'edit'>('add')
const modalFormRef = ref()
const formState = reactive({
  id: undefined as number | undefined,
  userAccount: '',
  userPassword: '', // 新建必须要密码
  userName: '',
  userAvatar: '',
  userProfile: '',
  userRole: 'user',
})

const openModal = (type: 'add' | 'edit', record?: API.UserVO) => {
  modalType.value = type
  if (type === 'add') {
    formState.id = undefined
    formState.userAccount = ''
    formState.userPassword = ''
    formState.userName = ''
    formState.userAvatar = ''
    formState.userProfile = ''
    formState.userRole = 'user'
  } else if (record) {
    formState.id = record.id
    formState.userAccount = record.userAccount || ''
    formState.userName = record.userName || ''
    formState.userAvatar = record.userAvatar || ''
    formState.userProfile = record.userProfile || ''
    formState.userRole = record.userRole || 'user'
  }
  modalVisible.value = true
}

const handleModalOk = async () => {
  try {
    await modalFormRef.value?.validate()
    submitLoading.value = true

    if (modalType.value === 'add') {
      // openapi 这里并没有直接生成一个万能的用户后台添加接口，可以通过组合 API：
      // 1. 调用注册接口创建用户 (带密码)
      const regRes = await userRegister({
        userAccount: formState.userAccount,
        userPassword: formState.userPassword,
        checkPassword: formState.userPassword,
      })
      // 2. 更新用户信息及角色
      if (regRes) {
        await updateUser({
          id: regRes as unknown as number,
          userName: formState.userName,
          userAvatar: formState.userAvatar,
          userProfile: formState.userProfile,
          userRole: formState.userRole,
        })
      }
      message.success('新建用户成功')
    } else {
      const res = await updateUser({
        id: formState.id as number,
        userName: formState.userName,
        userAvatar: formState.userAvatar,
        userProfile: formState.userProfile,
        userRole: formState.userRole,
      })
      if (res) {
        message.success('更新成功')
      }
    }
    modalVisible.value = false
    loadData()
  } catch (error) {
    // 可能是校验没过，也可能是接口报错
    if ((error as Error).message) {
      message.error((error as Error).message)
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-manage-container {
  padding: 0 0 24px;
}
.search-form {
  margin-bottom: 24px;
}
.table-operations {
  margin-bottom: 16px;
}
.danger-text {
  color: #ff4d4f;
}
</style>
