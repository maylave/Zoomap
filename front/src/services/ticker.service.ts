import api from './api'

export interface TickerItem {
  id: number
  text: string
  icon?: string
  displayOrder: number
  isActive: boolean
  speed?: number
  zoneId?: number
  createdAt?: string
  updatedAt?: string
}

export interface TickerResponse {
  items: TickerItem[]
  total: number
}

export interface CreateTickerInput {
  text: string
  icon?: string
  displayOrder?: number
  isActive?: boolean
  speed?: number
  zoneId?: number
}

export interface UpdateTickerInput {
  text?: string
  icon?: string
  displayOrder?: number
  isActive?: boolean
  speed?: number
  zoneId?: number
}

export const tickerService = {
  getAll: async (): Promise<TickerResponse> => {
    const response = await api.get('/ticker')

    if (Array.isArray(response.data)) {
      return {
        items: response.data,
        total: response.data.length,
      }
    }

    return response.data
  },

  create: async (data: CreateTickerInput): Promise<TickerItem> => {
    const response = await api.post('/ticker', data)
    return response.data
  },

  update: async (id: number, data: UpdateTickerInput): Promise<TickerItem> => {
    const response = await api.put(`/ticker/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ticker/${id}`)
  },
}
