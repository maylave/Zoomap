<template>
  <section id="gallery" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Warning Block (только для админа, скрывается в режиме удаления) -->
      <div
        v-if="authStore.isAdmin && !isDeleteMode"
        class="group/warning mb-10 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-4 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning-15"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
            <i class="fa-solid fa-triangle-exclamation text-warning"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">Управление галереей</p>
            <p class="text-cream-100/60 text-xs mt-0.5">
              Добавьте новые фото или отредактируйте существующие
            </p>
          </div>
        </div>

        <button
          class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-2 rounded-lg hover:bg-white/5"
          title="Редактировать галерею"
          @click="openSectionEditModal"
        >
          <i class="fa-solid fa-pen text-sm"></i>
        </button>
      </div>

      <!-- Панель удаления (когда выбраны фото) -->
      <div
        v-if="isDeleteMode && selectedPhotos.length > 0"
        class="mb-10 flex items-center justify-between rounded-2xl border border-terracotta/30 bg-terracotta/10 p-4 backdrop-blur-sm animate-fade-in"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/20">
            <i class="fa-solid fa-trash text-terracotta"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              Выбрано фото: {{ selectedPhotos.length }}
            </p>
            <p class="text-cream-100/60 text-xs mt-0.5">
              Нажмите "Удалить" для подтверждения
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="px-4 py-2 rounded-xl border border-white/10 text-cream-100/60 hover:text-cream-100 hover:bg-white/5 transition-all duration-smooth"
            @click="cancelDeleteMode"
          >
            Отмена
          </button>
          <button
            class="px-6 py-2 rounded-xl bg-terracotta text-cream-100 font-medium hover:bg-terracotta/90 hover:shadow-lg hover:shadow-terracotta/30 transition-all duration-smooth"
            @click="confirmDelete"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting">Удаление...</span>
            <span v-else>Удалить</span>
          </button>
        </div>
      </div>

      <!-- Header (редактируемые тексты) -->
      <div class="mb-14">
        <span
          class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
        >
          {{ sectionBadge }}
        </span>

        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
          {{ sectionTitle }}
        </h2>

        <p class="mt-4 max-w-xl text-cream-100/60">
          {{ sectionDescription }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-accent mb-4"></i>
        <p class="text-cream-100/60">Загрузка галереи...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="rounded-2xl border border-terracotta/30 bg-terracotta/10 p-8 text-center">
        <i class="fa-solid fa-triangle-exclamation text-4xl text-terracotta mb-3"></i>
        <p class="text-cream-100 mb-2">Ошибка загрузки галереи</p>
        <p class="text-cream-100/60 text-sm mb-4">{{ loadError }}</p>
        <button
          @click="loadGallery"
          class="rounded-full bg-accent px-6 py-2 text-forest-900 font-medium hover:bg-accent/90 transition"
        >
          <i class="fa-solid fa-rotate-right mr-2"></i>
          Повторить
        </button>
      </div>

      <!-- Masonry Grid -->
      <div v-else class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
        <div
          v-for="item in visibleGallery"
          :key="item.id"
          class="group relative mb-5 break-inside-avoid overflow-hidden rounded-3xl transition-all duration-300"
          :class="[
            isDeleteMode ? 'cursor-pointer' : 'cursor-pointer',
            { 'ring-4 ring-terracotta ring-offset-2 ring-offset-forest-400 scale-[0.98]': selectedPhotos.includes(item.id) }
          ]"
          @click="isDeleteMode ? toggleSelection(item.id) : openLightbox(item)"
        >
          <img
            :src="item.url"
            :alt="item.altText || item.caption || 'Фото'"
            loading="lazy"
            class="w-full h-auto rounded-3xl transition-transform duration-500 group-hover:scale-105"
            :class="{ 'group-hover:scale-100': isDeleteMode }"
          >

          <!-- Чекбокс для удаления -->
          <div
            v-if="isDeleteMode"
            class="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-black/40 backdrop-blur-md transition-all duration-200 shadow-lg"
            :class="selectedPhotos.includes(item.id) 
              ? 'border-terracotta bg-terracotta/30 scale-110' 
              : 'border-white/50 hover:border-white hover:bg-black/60'"
          >
            <i
              v-if="selectedPhotos.includes(item.id)"
              class="fa-solid fa-check text-white text-sm"
            ></i>
          </div>

          <!-- Кнопка редактирования (только для админа и не в режиме удаления) -->
          <button
            v-if="authStore.isAdmin && !isDeleteMode"
            class="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-cream-100/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent/30 hover:text-accent hover:border-accent/40 hover:scale-110"
            title="Редактировать фото"
            @click.stop="openPhotoEditModal(item)"
          >
            <i class="fa-solid fa-pen-to-square text-sm"></i>
          </button>

          <!-- Overlay (скрыт в режиме удаления) -->
          <div
            v-if="!isDeleteMode"
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <svg
              class="h-12 w-12 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>

          <!-- Caption -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
            :class="{ 'opacity-60': selectedPhotos.includes(item.id) }"
          >
            <p class="text-sm font-medium text-white">
              {{ item.caption || 'Без подписи' }}
            </p>
          </div>
        </div>

        <!-- Add New Photo Card -->
        <div
          v-if="authStore.isAdmin && !isDeleteMode"
          class="group/add relative mb-5 break-inside-avoid flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-accent/5"
          @click="openNewPhotoModal"
        >
          <div
            class="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 transition-all duration-300 group-hover/add:bg-accent/20 group-hover/add:scale-110"
          >
            <i
              class="fa-solid fa-plus text-3xl text-cream-100/40 transition-colors duration-300 group-hover/add:text-accent"
            ></i>
          </div>
          <div class="text-center px-4">
            <p class="text-cream-100 text-base font-medium">Добавить фото</p>
            <p class="text-cream-100/40 text-xs mt-1">Загрузить новое изображение</p>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div
          v-if="galleryItems.length === 0 && !isLoading"
          class="col-span-full py-20 text-center"
        >
          <i class="fa-solid fa-images text-6xl text-cream-100/20 mb-4"></i>
          <p class="text-cream-100/60 text-lg">В галерее пока нет фото</p>
          <p v-if="authStore.isAdmin" class="text-cream-100/40 text-sm mt-2">
            Нажмите на кнопку "Добавить фото", чтобы начать
          </p>
        </div>
      </div>

      <!-- Load More -->
      <div
        v-if="visibleCount < galleryItems.length && !isDeleteMode"
        class="mt-12 flex justify-center"
      >
        <button
          class="btn btn-accent rounded-full px-8"
          @click="loadMore"
        >
          <i class="fa-solid fa-images mr-2" />
          Показать ещё ({{ galleryItems.length - visibleCount }})
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="isOpen && currentItem"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
          @click.self="closeLightbox"
        >
          <button
            class="btn btn-circle absolute right-6 top-6"
            @click="closeLightbox"
          >
            ✕
          </button>

          <button
            v-if="currentIndex > 0"
            class="btn btn-circle absolute left-6"
            @click="prevImage"
          >
            ❮
          </button>

          <img
            :src="currentItem.url"
            :alt="currentItem.altText || currentItem.caption || 'Фото'"
            class="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
          >

          <button
            v-if="currentIndex < visibleGallery.length - 1"
            class="btn btn-circle absolute right-6"
            @click="nextImage"
          >
            ❯
          </button>

          <div
            class="absolute bottom-8 rounded-xl bg-black/50 px-5 py-3 text-white backdrop-blur"
          >
            {{ currentItem.caption || 'Без подписи' }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- EditModal для секции -->
    <EditModal
      :visible="isSectionEditModalOpen"
      title="Редактирование галереи"
      subtitle="Измените заголовок и описание секции"
      :fields="sectionEditFields"
      @close="closeSectionEditModal"
      @save="handleSectionEditSave"
    />

    <!-- EditModal для фото -->
    <EditModal
      :visible="isPhotoEditModalOpen"
      :title="photoEditModalTitle"
      :subtitle="photoEditModalSubtitle"
      :fields="photoEditFields"
      @close="closePhotoEditModal"
      @save="handlePhotoEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EditModal from '@/components/overlay/EditModal.vue'
import { useAuthStore } from '@/stores/auth'
import { galleryService } from '@/services/gallery.service'
import type { GalleryPhoto } from '@/services/gallery.service'

// ✅ Используем authStore вместо хардкода
const authStore = useAuthStore()

// ==================== СОСТОЯНИЕ ====================

const isLoading = ref(true)
const loadError = ref('')
const isDeleting = ref(false)
const isDeleteMode = ref(false)
const selectedPhotos = ref<number[]>([])

// Редактируемые тексты секции (локально)
const sectionBadge = ref('Фотогалерея')
const sectionTitle = ref('Живые моменты')
const sectionDescription = ref('Каждый день — новые истории. Загляните в нашу галерею и почувствуйте атмосферу ZooVerse.')

// Состояние для модалки редактирования секции
const isSectionEditModalOpen = ref(false)

// Состояние для модалки редактирования фото
const isPhotoEditModalOpen = ref(false)
const photoEditModalTitle = ref('Редактирование фото')
const photoEditModalSubtitle = ref('Измените описание изображения')
const editingPhoto = ref<GalleryPhoto | null>(null)
const isNewPhoto = ref(false)
const isSaving = ref(false)

// Данные галереи
const galleryItems = ref<GalleryPhoto[]>([])
const visibleCount = ref(12)

// Lightbox
const isOpen = ref(false)
const currentIndex = ref(0)

const visibleGallery = computed(() =>
  galleryItems.value.slice(0, visibleCount.value)
)

const currentItem = computed(
  () => visibleGallery.value[currentIndex.value] ?? null
)

// ==================== ЗАГРУЗКА ДАННЫХ ====================

const loadGallery = async () => {
  isLoading.value = true
  loadError.value = ''
  
  try {
    const response = await galleryService.getAll({ limit: 100 })
    galleryItems.value = response.photos
  } catch (error: any) {
    console.error('Error loading gallery:', error)
    loadError.value = error.response?.data?.error || 'Не удалось загрузить галерею'
    ElMessage.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

// ==================== ПОЛЯ ДЛЯ РЕДАКТИРОВАНИЯ ====================

const sectionEditFields = computed(() => [
  {
    key: 'sectionBadge',
    label: 'Бейдж секции',
    type: 'text' as const,
    value: sectionBadge.value,
    placeholder: 'Например: Фотогалерея',
    hint: 'Маленький текст над заголовком',
    icon: 'fa-solid fa-tag',
  },
  {
    key: 'sectionTitle',
    label: 'Заголовок',
    type: 'text' as const,
    value: sectionTitle.value,
    placeholder: 'Например: Живые моменты',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'sectionDescription',
    label: 'Описание',
    type: 'textarea' as const,
    value: sectionDescription.value,
    placeholder: 'Описание секции',
    rows: 3,
    icon: 'fa-solid fa-align-left',
  },
])

const photoEditFields = computed(() => {
  return [
    {
      key: 'url',
      label: 'URL изображения',
      type: 'url' as const,
      value: editingPhoto.value?.url || '',
      placeholder: 'https://example.com/photo.jpg',
      required: true,
      hint: 'Вставьте прямую ссылку на изображение',
      icon: 'fa-solid fa-image',
    },
    {
      key: 'caption',
      label: 'Подпись',
      type: 'text' as const,
      value: editingPhoto.value?.caption || '',
      placeholder: 'Например: Король саванны',
      hint: 'Текст, отображаемый под фото',
      icon: 'fa-solid fa-font',
    },
    {
      key: 'altText',
      label: 'Alt-текст',
      type: 'text' as const,
      value: editingPhoto.value?.altText || '',
      placeholder: 'Например: Лев',
      hint: 'Описание для доступности и SEO',
      icon: 'fa-solid fa-universal-access',
    },
  ]
})

// ==================== LIGHTBOX ====================

const openLightbox = (photo: GalleryPhoto) => {
  const index = visibleGallery.value.findIndex(p => p.id === photo.id)
  if (index !== -1) {
    currentIndex.value = index
    isOpen.value = true
    document.body.style.overflow = 'hidden'
  }
}

const closeLightbox = () => {
  isOpen.value = false
  document.body.style.overflow = ''
}

const nextImage = () => {
  if (currentIndex.value < visibleGallery.value.length - 1) {
    currentIndex.value++
  }
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const loadMore = () => {
  visibleCount.value += 8
}

// ==================== РЕЖИМ УДАЛЕНИЯ ====================

const enableDeleteMode = () => {
  isDeleteMode.value = true
  selectedPhotos.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedPhotos.value = []
}

const toggleSelection = (id: number) => {
  const idx = selectedPhotos.value.indexOf(id)
  if (idx > -1) {
    selectedPhotos.value.splice(idx, 1)
  } else {
    selectedPhotos.value.push(id)
  }
}

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `Удалить ${selectedPhotos.value.length} фото? Это действие нельзя отменить.`,
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'bg-red-500 hover:bg-red-600',
      }
    )
    
    isDeleting.value = true
    
    // Удаляем все выбранные фото через API
    await Promise.all(
      selectedPhotos.value.map(id => galleryService.delete(id))
    )
    
    ElMessage.success(`Удалено фото: ${selectedPhotos.value.length}`)
    
    // Перезагружаем галерею
    await loadGallery()
    
    selectedPhotos.value = []
    isDeleteMode.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  } finally {
    isDeleting.value = false
  }
}

// ==================== EDIT MODAL: СЕКЦИЯ ====================

const openSectionEditModal = () => {
  isSectionEditModalOpen.value = true
}

const closeSectionEditModal = () => {
  isSectionEditModalOpen.value = false
}

const handleSectionEditSave = (values: Record<string, any>) => {
  // Сохраняем локально (можно потом добавить API для сохранения настроек секции)
  if (values.sectionBadge !== undefined) sectionBadge.value = values.sectionBadge
  if (values.sectionTitle !== undefined) sectionTitle.value = values.sectionTitle
  if (values.sectionDescription !== undefined) sectionDescription.value = values.sectionDescription
  ElMessage.success('Галерея обновлена')
}

// ==================== EDIT MODAL: ФОТО ====================

const openPhotoEditModal = (photo: GalleryPhoto) => {
  editingPhoto.value = photo
  isNewPhoto.value = false
  photoEditModalTitle.value = 'Редактирование фото'
  photoEditModalSubtitle.value = `Редактирование: ${photo.caption || 'Без подписи'}`
  isPhotoEditModalOpen.value = true
}

const openNewPhotoModal = () => {
  editingPhoto.value = null
  isNewPhoto.value = true
  photoEditModalTitle.value = 'Добавить новое фото'
  photoEditModalSubtitle.value = 'Заполните данные нового изображения'
  isPhotoEditModalOpen.value = true
}

const closePhotoEditModal = () => {
  isPhotoEditModalOpen.value = false
  editingPhoto.value = null
  isNewPhoto.value = false
}

const handlePhotoEditSave = async (values: Record<string, any>) => {
  if (isSaving.value) return
  isSaving.value = true
  
  try {
    // Для нового фото нужен albumId
    // Пока используем первый альбом или создаём дефолтный
    // В будущем можно добавить выбор альбома в форме
    const albumId = 1 // TODO: заменить на выбор альбома
    
    if (isNewPhoto.value) {
      // Добавление нового фото через API
      await galleryService.create({
        albumId,
        url: values.url,
        caption: values.caption || '',
        altText: values.altText || '',
      })
      ElMessage.success('Фото добавлено')
    } else if (editingPhoto.value) {
      // Обновление существующего фото через API
      await galleryService.update(editingPhoto.value.id, {
        url: values.url,
        caption: values.caption,
        altText: values.altText,
      })
      ElMessage.success('Фото обновлено')
    }
    
    // Перезагружаем галерею
    await loadGallery()
    closePhotoEditModal()
  } catch (error: any) {
    console.error('Save error:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  } finally {
    isSaving.value = false
  }
}

// ==================== EXPOSE ====================

interface GalleryExpose {
  isDeleteMode: typeof isDeleteMode
  enableDeleteMode: () => void
  cancelDeleteMode: () => void
}

defineExpose<GalleryExpose>({
  isDeleteMode,
  enableDeleteMode,
  cancelDeleteMode,
})

// ==================== KEYBOARD NAVIGATION ====================

const handleKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadGallery()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.break-inside-avoid {
  break-inside: avoid;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>