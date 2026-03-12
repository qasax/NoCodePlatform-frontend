import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUser } from '@/api/yonghuguanli'

export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
    userRole: 'guest',
  })
  // 记录是否已经从服务端完成了首屏用户信息拉取
  const firstFetched = ref<boolean>(false)

  // 获取登录用户信息
  const fetchLoginUser = async () => {
    try {
      const res = await getLoginUser()
      if (res) {
        loginUser.value = res as unknown as API.LoginUserVO
      } else {
        loginUser.value = { userName: '未登录', userRole: 'guest' }
      }
    } catch {
      loginUser.value = { userName: '未登录', userRole: 'guest' }
    } finally {
      firstFetched.value = true
    }
  }

  // 设置登录用户信息（登录成功后使用）
  const setLoginUser = (user: API.LoginUserVO) => {
    loginUser.value = user
  }

  return { loginUser, firstFetched, fetchLoginUser, setLoginUser }
})
