import type { GalleryItem } from '@/types/gallery'
import api from '../services/api'

export const getPhotos = async (): Promise<GalleryItem[]> => {
  const { data } = await api.get<GalleryItem[]>('/photo')
  return data
}
