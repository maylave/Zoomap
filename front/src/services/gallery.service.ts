import api from './api'

export interface GalleryPhoto {
  id: number
  albumId: number
  url: string
  caption: string | null
  altText: string | null
  uploadedBy: number
  uploadedAt: string
  updatedAt?: string
  album?: {
    id: number
    title: string
    description?: string
  }
  uploader?: {
    id: number
    name: string
    email: string
  }
}

export interface GalleryResponse {
  photos: GalleryPhoto[]
  total: number
  limit: number
  offset: number
}

export interface CreatePhotoInput {
  albumId: number
  url: string
  caption?: string
  altText?: string
}

export interface UpdatePhotoInput {
  albumId?: number
  url?: string
  caption?: string
  altText?: string
}

export const galleryService = {
  // Получить все фото
  getAll: async (params?: {
    albumId?: number
    limit?: number
    offset?: number
  }): Promise<GalleryResponse> => {
    const response = await api.get('/gallery', { params })
    return response.data
  },

  // Получить фото по ID
  getById: async (id: number): Promise<GalleryPhoto> => {
    const response = await api.get(`/gallery/${id}`)
    return response.data
  },

  // Добавить фото (админ)
  create: async (data: CreatePhotoInput): Promise<GalleryPhoto> => {
    const response = await api.post('/gallery', data)
    return response.data
  },

  // Обновить фото (админ)
  update: async (id: number, data: UpdatePhotoInput): Promise<GalleryPhoto> => {
    const response = await api.put(`/gallery/${id}`, data)
    return response.data
  },

  // Удалить фото (админ)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/gallery/${id}`)
  },
}
