import api from './api'

export interface Animal {
  id: number
  name: string
  scientificName: string
  zone: string
  zoneId: number
  image: string
  description: string
  diet: string
  weight: string
  age: string
  lifespan?: string
  rating: number
  reviewsCount: number
  reviews?: Review[]
  photos?: Photo[]
}

export interface Review {
  id: number
  author: string
  rating: number
  text: string
  date: string
}

export interface Photo {
  id: number
  url: string
  caption?: string
  altText?: string
  isPrimary: boolean
}

export interface Zone {
  id: number
  name: string
}

export interface AnimalsResponse {
  animals: Animal[]
  total: number
}

export interface CreateAnimalInput {
  name: string
  species: string
  zoneId: number
  diet: 'хищник' | 'травоядное' | 'всеядное'
  weight?: number
  age?: number
  description?: string
  image?: string
}

export interface UpdateAnimalInput {
  name?: string
  species?: string
  zoneId?: number
  diet?: 'хищник' | 'травоядное' | 'всеядное'
  weight?: number
  age?: number
  description?: string
  image?: string
}

export const animalsService = {
  getAll: async (params?: {
    zoneId?: number
    limit?: number
    offset?: number
  }): Promise<AnimalsResponse> => {
    const response = await api.get('/animals', { params })

    if (Array.isArray(response.data)) {
      return {
        animals: response.data,
        total: response.data.length,
      }
    }

    return response.data
  },

  getById: async (id: number): Promise<Animal> => {
    const response = await api.get(`/animals/${id}`)
    return response.data
  },

  create: async (data: CreateAnimalInput): Promise<Animal> => {
    const response = await api.post('/animals', data)
    return response.data
  },

  update: async (id: number, data: UpdateAnimalInput): Promise<Animal> => {
    const response = await api.put(`/animals/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/animals/${id}`)
  },

  getReviews: async (animalId: number): Promise<Review[]> => {
    const response = await api.get(`/animals/${animalId}/reviews`)
    return response.data
  },

  addReview: async (
    animalId: number,
    data: { rating: number; comment: string }
  ): Promise<Review> => {
    const response = await api.post(`/animals/${animalId}/reviews`, data)
    return response.data
  },
}
