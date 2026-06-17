// front/src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authService } from '@/services/auth.service'

// ✅ Добавляем интерфейс User с avatarUrl
export interface User {
  id: number
  name: string
  email: string
  login: string
  role: string
  avatarUrl?: string | null // ✅ Добавляем поле
  createdAt?: string
}

// ✅ Интерфейс для ответа авторизации
export interface AuthResponse {
  user: User
  token: string
  password?: string
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const isLoading = ref(false)
  const generatedPassword = ref<string>('')

  // ✅ Computed
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => {
    const role = user.value?.role
    return role === 'admin' || role === 'dev'
  })
  const isDev = computed(() => user.value?.role === 'dev')
  const isUser = computed(() => user.value?.role === 'user')
  const userName = computed(() => user.value?.name || 'Гость')
  const userRole = computed(() => user.value?.role || 'user')

  // ✅ Аватар
  const userAvatar = computed(() => {
    return user.value?.avatarUrl || localStorage.getItem('userAvatar') || null
  })

  // ==================== ACTIONS ====================

  async function login(identifier: string, password: string) {
    isLoading.value = true
    try {
      const response: AuthResponse = await authService.login({ identifier, password })
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)

      // ✅ Сохраняем аватар если есть
      if (response.user.avatarUrl) {
        localStorage.setItem('userAvatar', response.user.avatarUrl)
      }

      ElMessage.success(`Добро пожаловать, ${response.user.name}!`)
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || 'Ошибка входа')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function register(name: string, email: string) {
    isLoading.value = true
    try {
      const response: AuthResponse = await authService.register({ name, email })
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)

      if (response.password) {
        generatedPassword.value = response.password
      }

      // ✅ Сохраняем аватар если есть
      if (response.user.avatarUrl) {
        localStorage.setItem('userAvatar', response.user.avatarUrl)
      }

      ElMessage.success('Регистрация успешна!')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || 'Ошибка регистрации')
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    user.value = null
    token.value = ''
    generatedPassword.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userAvatar') // ✅ Очищаем аватар
    ElMessage.info('Вы вышли из аккаунта')
    router.push('/login')
  }

  // ✅ Восстановление профиля при инициализации
  async function fetchProfile() {
    if (!token.value) return null
    try {
      const profile: User = await authService.getMe()

      // ✅ Восстанавливаем аватар из localStorage если нет в профиле
      if (!profile.avatarUrl) {
        const savedAvatar = localStorage.getItem('userAvatar')
        if (savedAvatar) {
          profile.avatarUrl = savedAvatar
        }
      } else {
        // ✅ Сохраняем аватар из профиля в localStorage
        localStorage.setItem('userAvatar', profile.avatarUrl)
      }

      user.value = profile
      return profile
    } catch (error: any) {
      // Если токен невалидный - очищаем
      if (error.response?.status === 401) {
        user.value = null
        token.value = ''
        localStorage.removeItem('token')
        localStorage.removeItem('userAvatar')
      }
      throw error
    }
  }

  // ✅ Инициализация при загрузке приложения
  async function init() {
    if (token.value && !user.value) {
      try {
        await fetchProfile()
      } catch (error) {
        console.error('Init error:', error)
      }
    }
  }

  // ✅ Обновить аватар в store
  function updateAvatar(avatarUrl: string | null) {
    if (user.value) {
      user.value.avatarUrl = avatarUrl
    }

    if (avatarUrl) {
      localStorage.setItem('userAvatar', avatarUrl)
    } else {
      localStorage.removeItem('userAvatar')
    }
  }

  function clearGeneratedPassword() {
    generatedPassword.value = ''
  }

  return {
    user,
    token,
    isLoading,
    generatedPassword,
    isAuthenticated,
    isAdmin,
    isDev,
    isUser,
    userName,
    userRole,
    userAvatar, // ✅ Экспортируем
    login,
    register,
    logout,
    fetchProfile,
    init,
    updateAvatar, // ✅ Экспортируем
    clearGeneratedPassword,
  }
})
