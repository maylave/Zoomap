import api from './api'

export interface ZoneAnimal {
  id: number
  name: string
  species?: string
  description?: string
  rating?: number
  image?: string
}

export interface Zone {
  id: number
  name: string
  location: string
  image: string
  description: string
  climate: string
  hours: string
  position: {
    x: number
    y: number
  }
  animals: ZoneAnimal[]
  animalsCount: number
}

export interface ZonesResponse {
  zones: Zone[]
  total: number
}

export interface CreateZoneInput {
  name: string
  description?: string
  image?: string
  climate?: string
  hours?: string
  location?: string
  positionX: number
  positionY: number
}

export interface UpdateZoneInput {
  name?: string
  description?: string
  image?: string
  climate?: string
  hours?: string
  location?: string
  positionX?: number
  positionY?: number
}

export const zonesService = {
  // Получить все зоны
  getAll: async (): Promise<ZonesResponse> => {
    const response = await api.get('/zones')

    // Если приходит массив — оборачиваем в объект
    if (Array.isArray(response.data)) {
      return {
        zones: response.data,
        total: response.data.length,
      }
    }

    return response.data
  },

  // Получить зону по ID
  getById: async (id: number): Promise<Zone> => {
    const response = await api.get(`/zones/${id}`)
    return response.data
  },

  // Создать зону (админ)
  create: async (data: CreateZoneInput): Promise<Zone> => {
    const response = await api.post('/zones', data)
    return response.data
  },

  // Обновить зону (админ)
  update: async (id: number, data: UpdateZoneInput): Promise<Zone> => {
    const response = await api.put(`/zones/${id}`, data)
    return response.data
  },

  // Удалить зону (админ)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/zones/${id}`)
  },
}
