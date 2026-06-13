import { getPhotos } from '@/api/photo.servce'
import { fallbackGallery } from '@/data/gallery'

import type { GalleryItem } from '@/types/gallery'

export const fetchGallery = async (): Promise<GalleryItem[]> => {
  try {
    const photos = await getPhotos()

    return photos.length ? photos : fallbackGallery
  } catch {
    return fallbackGallery
  }
}
