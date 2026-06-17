import api from './api'

export interface SubscribeRequest {
  name: string
  email: string
  subscribe?: boolean
}

export interface SubscribeResponse {
  message: string
  promoCode: string
  email: string
  password?: string // ✅ Добавляем (для новых пользователей)
  token?: string // ✅ Добавляем (для новых пользователей)
  isNewUser?: boolean // ✅ Добавляем (флаг нового пользователя)
}

export interface SubscriptionStatus {
  email: string
  isSubscribed: boolean
  subscribedAt: string | null
}

export interface SubscribersResponse {
  total: number
  active: number
  inactive: number
  subscribers: Array<{
    id: number
    name: string
    email: string
    subscribe: boolean
    createdAt: string
  }>
}

export const subscriptionService = {
  // Подписаться
  subscribe: async (data: SubscribeRequest): Promise<SubscribeResponse> => {
    const response = await api.post('/subscription/subscribe', data)
    return response.data
  },

  // Отписаться
  unsubscribe: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/subscription/unsubscribe', { email })
    return response.data
  },

  // Проверить статус подписки
  checkStatus: async (email: string): Promise<SubscriptionStatus> => {
    const response = await api.get(`/subscription/status?email=${encodeURIComponent(email)}`)
    return response.data
  },

  // Получить всех подписчиков (только для админа)
  getSubscribers: async (): Promise<SubscribersResponse> => {
    const response = await api.get('/subscription/admin/subscribers')
    return response.data
  },
}
