<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 sm:p-6">
      <div class="mb-4 flex justify-between">
        <div class="text-cream-100/60">Всего фото: {{ photos.length }}</div>
        <button @click="openCreateModal" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
          + Добавить фото
        </button>
      </div>

      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div v-for="photo in photos" :key="photo.id" class="group relative overflow-hidden rounded-xl border border-sage/15 bg-forest-400/40">
          <img :src="photo.url" :alt="photo.caption || 'Фото'" class="h-40 w-full object-cover" />
          <div class="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
            <div class="flex-1">
              <p class="text-sm font-medium text-white">{{ photo.caption || 'Без подписи' }}</p>
            </div>
            <div class="flex gap-1">
              <button @click="openEditModal(photo)" class="rounded-lg bg-white/20 p-1.5 text-white hover:bg-lime/30">
                <i class="fa-solid fa-pen text-xs"></i>
              </button>
              <button @click="deletePhoto(photo.id)" class="rounded-lg bg-white/20 p-1.5 text-white hover:bg-terracotta/30">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <Transition name="modal-backdrop">
      <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" @click="closeModal">
        <div @click.stop class="w-full max-w-md rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl">
          <h3 class="mb-4 text-lg font-bold text-cream-100">{{ editingPhoto ? 'Редактировать фото' : 'Новое фото' }}</h3>
          <div class="space-y-3">
            <input v-model="form.url" placeholder="URL изображения" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.caption" placeholder="Подпись" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
            <input v-model="form.altText" placeholder="Alt-текст" class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100" />
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button @click="closeModal" class="rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2 text-sm text-cream-100/80">Отмена</button>
            <button @click="savePhoto" class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime">
              {{ editingPhoto ? '💾 Сохранить' : '✨ Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { galleryService, type GalleryPhoto } from '@/services/gallery.service'

const isLoading = ref(true)
const photos = ref<GalleryPhoto[]>([])
const showModal = ref(false)
const editingPhoto = ref<GalleryPhoto | null>(null)

const form = ref({ url: '', caption: '', altText: '' })

const loadPhotos = async () => {
  isLoading.value = true
  try {
    const response = await galleryService.getAll()
    photos.value = response.photos
  } catch (error) {
    ElMessage.error('Ошибка загрузки фото')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingPhoto.value = null
  form.value = { url: '', caption: '', altText: '' }
  showModal.value = true
}

const openEditModal = (photo: GalleryPhoto) => {
  editingPhoto.value = photo
  form.value = { url: photo.url, caption: photo.caption || '', altText: photo.altText || '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingPhoto.value = null
}

const savePhoto = async () => {
  try {
    const data = {
      albumId: 1, // Дефолтный альбом
      url: form.value.url,
      caption: form.value.caption,
      altText: form.value.altText,
    }

    if (editingPhoto.value) {
      await galleryService.update(editingPhoto.value.id, data)
      ElMessage.success('Фото обновлено')
    } else {
      await galleryService.create(data)
      ElMessage.success('Фото добавлено')
    }

    closeModal()
    await loadPhotos()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const deletePhoto = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить это фото?', 'Подтверждение', {
      confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', type: 'warning',
    })
    await galleryService.delete(id)
    ElMessage.success('Фото удалено')
    await loadPhotos()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error('Ошибка удаления')
  }
}

onMounted(() => loadPhotos())
</script>

<style scoped>
.modal-backdrop-enter-active, .modal-backdrop-leave-active { transition: opacity 0.3s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }
</style>