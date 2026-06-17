import api from './api'

// ==================== ТИПЫ БИЛЕТОВ ====================

export interface TicketType {
  id: number
  name: string
  description?: string
  price: number
  minAge?: number
  maxAge?: number
  maxQuantity?: number
  isActive: boolean
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingTicket {
  id: number
  bookingId: number
  ticketTypeId: number
  quantity: number
  price: number
  ticketType: TicketType
}

export interface Booking {
  id: number
  userId: number
  visitDate: string
  visitTime: string
  status: 'pending' | 'paid' | 'cancelled'
  totalPrice: number
  paymentId?: string
  createdAt: string
  tickets: BookingTicket[]
  user?: {
    id: number
    name: string
    email: string
  }
  discount?: {
    amount: number
    applied: boolean
  } | null
}

export interface BookInput {
  visitDate: string
  visitTime: string
  tickets: Array<{
    ticketTypeId: number
    quantity: number
  }>
  userPromocodeId?: number
}

export interface ValidatedPromo {
  id: number
  code: string
  discount: number
  discountType: 'percent' | 'fixed'
  description?: string
  minOrderAmount?: number
  expiresAt: string
}

// ==================== ТИПЫ БЕГУЩЕЙ СТРОКИ ====================

export interface TickerItem {
  id: number
  text: string
  zoneId?: number | null
  zoneName?: string | null
  icon?: string | null
  link?: string | null
  displayOrder: number
  isActive: boolean
  speed: number
}

// ==================== СЕРВИС БИЛЕТОВ ====================

export const ticketsService = {
  // Получить все типы билетов
  getTypes: async (): Promise<TicketType[]> => {
    const response = await api.get('/tickets/types')
    return response.data
  },

  // Получить расписание
  getSchedule: async () => {
    const response = await api.get('/tickets/schedule')
    return response.data
  },

  // Получить слоты на дату
  getTimeSlots: async (date: string): Promise<TimeSlot[]> => {
    const response = await api.get(`/tickets/schedule/${date}/slots`)
    return response.data
  },

  // Проверить промокод
  validatePromo: async (): Promise<ValidatedPromo> => {
    const response = await api.post('/tickets/validate-promo')
    return response.data
  },

  // Создать бронирование
  book: async (data: BookInput): Promise<Booking> => {
    const response = await api.post('/tickets/book', data)
    return response.data
  },

  // Получить мои бронирования
  getMyBookings: async (params?: {
    limit?: number
    offset?: number
    status?: string
  }): Promise<Booking[]> => {
    const response = await api.get('/tickets/my-bookings', { params })
    return response.data
  },

  // Отменить бронирование
  cancelBooking: async (id: number): Promise<void> => {
    await api.post(`/tickets/bookings/${id}/cancel`)
  },

  // Подтвердить оплату
  confirmPayment: async (id: number, paymentId?: string): Promise<void> => {
    await api.post(`/tickets/bookings/${id}/payment`, { paymentId })
  },

  // ==================== АДМИН ====================

  // Все бронирования (админ)
  getAllBookings: async (params?: {
    limit?: number
    offset?: number
    status?: string
    date?: string
  }): Promise<Booking[]> => {
    const response = await api.get('/tickets/admin/all-bookings', { params })
    return response.data
  },

  // Статистика (админ)
  getStats: async () => {
    const response = await api.get('/tickets/admin/stats')
    return response.data
  },
}

// ==================== СЕРВИС БЕГУЩЕЙ СТРОКИ ====================

export const tickerService = {
  getAll: async (params?: {
    activeOnly?: boolean
  }): Promise<{ items: TickerItem[]; total: number }> => {
    const response = await api.get('/ticker', { params })
    return response.data
  },

  getById: async (id: number): Promise<TickerItem> => {
    const response = await api.get(`/ticker/${id}`)
    return response.data
  },

  create: async (data: {
    text: string
    zoneId?: number
    icon?: string
    link?: string
    displayOrder?: number
    isActive?: boolean
    speed?: number
  }): Promise<TickerItem> => {
    const response = await api.post('/ticker', data)
    return response.data
  },

  update: async (
    id: number,
    data: {
      text?: string
      zoneId?: number
      icon?: string
      link?: string
      displayOrder?: number
      isActive?: boolean
      speed?: number
    }
  ): Promise<TickerItem> => {
    const response = await api.put(`/ticker/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ticker/${id}`)
  },
}
