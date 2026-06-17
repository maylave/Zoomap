import api from './api'

export interface EventItem {
  id: number
  day: string
  month: string
  icon: string
  category: string
  title: string
  description: string
  price: string
  priceLabel: string
  button: string
  location: string
  date: string
  dateBg: string
  categoryColor: string
  creator?: {
    id: number
    name: string
    email: string
  }
}

export interface EventsResponse {
  events: EventItem[]
  total: number
}

export interface CreateEventInput {
  title: string
  description?: string
  date: string
  day: number
  month: string
  icon?: string
  category: string
  price: string
  priceLabel?: string
  buttonText: string
  location: string
}

export interface UpdateEventInput {
  title?: string
  description?: string
  date?: string
  day?: number
  month?: string
  icon?: string
  category?: string
  price?: string
  priceLabel?: string
  buttonText?: string
  location?: string
}

export const eventsService = {
  // Получить все события
  getAll: async (params?: {
    limit?: number
    offset?: number
    category?: string
  }): Promise<EventsResponse> => {
    const response = await api.get('/events', { params })
    return response.data
  },

  // Получить событие по ID
  getById: async (id: number): Promise<EventItem> => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  // Создать событие (только админ)
  create: async (data: CreateEventInput): Promise<EventItem> => {
    const response = await api.post('/events', data)
    return response.data
  },

  // Обновить событие (только админ)
  update: async (id: number, data: UpdateEventInput): Promise<EventItem> => {
    const response = await api.put(`/events/${id}`, data)
    return response.data
  },

  // Удалить событие (только админ)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`)
  },
}
