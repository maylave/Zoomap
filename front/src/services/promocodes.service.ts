import api from './api'

export interface Promocode {
  id: number
  code: string
  discount: number
  type: 'percent' | 'fixed'
  status: 'active' | 'expired' | 'used'
  createdAt: string
  expiresAt: string
  description: string
  used: boolean
}

export interface PromocodesResponse {
  promocodes: Promocode[]
  total: number
}

export interface ValidatedPromo {
  id: number
  code: string
  discount: number
  discountType: 'percent' | 'fixed'
  description?: string
  expiresAt: string
}

export const promocodesService = {
  // Получить мои промокоды
  getMy: async (): Promise<PromocodesResponse> => {
    const response = await api.get('/promocodes/my')

    // Защита от разных форматов ответа
    if (Array.isArray(response.data)) {
      return {
        promocodes: response.data,
        total: response.data.length,
      }
    }

    return response.data
  },

  // Проверить промокод
  validate: async (code: string): Promise<ValidatedPromo> => {
    const response = await api.post('/promocodes/validate', { code })
    return response.data
  },

  // Применить промокод к бронированию
  apply: async (
    code: string,
    bookingId?: number
  ): Promise<{
    message: string
    discount: number
    discountType: 'percent' | 'fixed'
  }> => {
    const response = await api.post('/promocodes/apply', {
      code,
      bookingId,
    })
    return response.data
  },
}
