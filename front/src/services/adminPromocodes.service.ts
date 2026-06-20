import api from './api'

export interface AdminPromocode {
  id: number
  code: string
  discount: number
  discountType: 'percent' | 'fixed'
  description: string
  status: 'active' | 'inactive' | 'expired'
  usageLimit: number | null
  usedCount: number
  grantedCount: number
  validFrom: string
  validUntil: string
  minOrderAmount: number | null
  createdBy: number
  createdAt: string
}

export interface GeneratePromoInput {
  quantity: number
  discount: number
  discountType: 'percent' | 'fixed'
  description?: string
  usageLimit?: number
  validFrom?: string
  validUntil?: string
  minOrderAmount?: number
  prefix?: string
}

export interface GrantPromoInput {
  promocodeId: number
  userId: number
  expiresDays?: number
}

export interface PromocodesStats {
  total: number
  active: number
  totalUsage: number
  used: number
}

export const adminPromocodesService = {
  // Массовая генерация
  generate: async (
    data: GeneratePromoInput
  ): Promise<{
    promocodes: AdminPromocode[]
    total: number
  }> => {
    const response = await api.post('/admin/promocodes/generate', data)
    return response.data
  },

  // Выдать промокод пользователю
  grant: async (
    data: GrantPromoInput
  ): Promise<{
    message: string
    userPromocode: any
  }> => {
    const response = await api.post('/admin/promocodes/grant', data)
    return response.data
  },

  // Выдать промокод всем пользователям
  grantAll: async (
    promocodeId: number,
    expiresDays?: number
  ): Promise<{
    message: string
    granted: number
    skipped: number
  }> => {
    const response = await api.post('/admin/promocodes/grant-all', {
      promocodeId,
      expiresDays,
    })
    return response.data
  },

  // Получить все промокоды
  getAll: async (): Promise<{
    promocodes: AdminPromocode[]
    total: number
  }> => {
    const response = await api.get('/admin/promocodes')

    if (Array.isArray(response.data)) {
      return {
        promocodes: response.data,
        total: response.data.length,
      }
    }

    return response.data
  },

  // Статистика
  getStats: async (): Promise<PromocodesStats> => {
    const response = await api.get('/admin/promocodes/stats')
    return response.data
  },

  // Удалить промокод
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/promocodes/${id}`)
  },
}
