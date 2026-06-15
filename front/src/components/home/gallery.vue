<template>
  <section id="gallery" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Warning Block (только для админа, скрывается в режиме удаления) -->
      <div
        v-if="isAdmin && !isDeleteMode"
        class="group/warning mb-10 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-4 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
            <i class="fa-solid fa-triangle-exclamation text-warning"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              Управление галереей
            </p>
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
          >
            Удалить
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

      <!-- Masonry Grid -->
      <div class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
        <div
          v-for="(item, index) in visibleGallery"
          :key="index"
          class="group relative mb-5 break-inside-avoid overflow-hidden rounded-3xl transition-all duration-300"
          :class="[
            isDeleteMode ? 'cursor-pointer' : 'cursor-pointer',
            { 'ring-4 ring-terracotta ring-offset-2 ring-offset-forest-400 scale-[0.98]': selectedPhotos.includes(index) }
          ]"
          @click="isDeleteMode ? toggleSelection(index) : openLightbox(index)"
        >
          <img
            :src="item.image"
            :alt="item.alt"
            loading="lazy"
            class="w-full h-auto rounded-3xl transition-transform duration-500 group-hover:scale-105"
            :class="{ 'group-hover:scale-100': isDeleteMode }"
          >

          <!-- Чекбокс для удаления -->
          <div
            v-if="isDeleteMode"
            class="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-black/40 backdrop-blur-md transition-all duration-200 shadow-lg"
            :class="selectedPhotos.includes(index) 
              ? 'border-terracotta bg-terracotta/30 scale-110' 
              : 'border-white/50 hover:border-white hover:bg-black/60'"
          >
            <i
              v-if="selectedPhotos.includes(index)"
              class="fa-solid fa-check text-white text-sm"
            ></i>
          </div>

          <!-- Кнопка редактирования (только для админа и не в режиме удаления) -->
          <button
            v-if="isAdmin && !isDeleteMode"
            class="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-cream-100/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent/30 hover:text-accent hover:border-accent/40 hover:scale-110"
            title="Редактировать фото"
            @click.stop="openPhotoEditModal(index)"
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
            :class="{ 'opacity-60': selectedPhotos.includes(index) }"
          >
            <p class="text-sm font-medium text-white">
              {{ item.caption }}
            </p>
          </div>
        </div>

        <!-- Add New Photo Card -->
        <div
          v-if="isAdmin && !isDeleteMode"
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
          Показать ещё
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
            :src="currentItem.image"
            :alt="currentItem.alt"
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
            {{ currentItem.caption }}
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
import EditModal from '@/components/overlay/EditModal.vue'
import type { GalleryItem } from '@/types/gallery'

// Флаг администратора
const isAdmin = ref(true)

// Режим удаления
const isDeleteMode = ref(false)
const selectedPhotos = ref<number[]>([])

// Редактируемые тексты секции
const sectionBadge = ref('Фотогалерея')
const sectionTitle = ref('Живые моменты')
const sectionDescription = ref('Каждый день — новые истории. Загляните в нашу галерею и почувствуйте атмосферу ZooVerse.')

// Состояние для модалки редактирования секции
const isSectionEditModalOpen = ref(false)

// Состояние для модалки редактирования фото
const isPhotoEditModalOpen = ref(false)
const photoEditModalTitle = ref('Редактирование фото')
const photoEditModalSubtitle = ref('Измените описание изображения')
const editingPhotoIndex = ref<number | null>(null)
const isNewPhoto = ref(false)

// Поля для редактирования секции
const sectionEditFields = computed(() => [
  {
    key: 'sectionBadge',
    label: 'Бейдж секции',
    value: sectionBadge.value,
    placeholder: 'Например: Фотогалерея',
    hint: 'Маленький текст над заголовком',
    icon: 'fa-solid fa-tag',
    type: 'text' as const,
  },
  {
    key: 'sectionTitle',
    label: 'Заголовок',
    value: sectionTitle.value,
    placeholder: 'Например: Живые моменты',
    required: true,
    icon: 'fa-solid fa-heading',
    type: 'text' as const,
  },
  {
    key: 'sectionDescription',
    label: 'Описание',
    value: sectionDescription.value,
    placeholder: 'Описание секции',
    rows: 3,
    icon: 'fa-solid fa-align-left',
    type: 'textarea' as const,
  },
])

// Поля для редактирования фото
const photoEditFields = computed(() => {
  const photo = editingPhotoIndex.value !== null ? galleryItems.value[editingPhotoIndex.value] : null
  
  return [
    {
      key: 'image',
      label: 'URL изображения',
      value: photo?.image || '',
      placeholder: 'https://example.com/photo.jpg',
      required: true,
      hint: 'Вставьте прямую ссылку на изображение',
      icon: 'fa-solid fa-image',
      type: 'url' as const,
    },
    {
      key: 'caption',
      label: 'Подпись (caption)',
      value: photo?.caption || '',
      placeholder: 'Например: Король саванны',
      required: true,
      hint: 'Текст, отображаемый под фото',
      icon: 'fa-solid fa-font',
      type: 'text' as const,
    },
    {
      key: 'alt',
      label: 'Alt-текст',
      value: photo?.alt || '',
      placeholder: 'Например: Лев',
      required: true,
      hint: 'Описание для доступности и SEO',
      icon: 'fa-solid fa-universal-access',
      type: 'text' as const,
    },
  ]
})

const galleryItems = ref<GalleryItem[]>([
  {
    image: 'https://i.pinimg.com/736x/7b/95/56/7b95561484af45e59535ca3b67fb1e70.jpg',
    alt: 'Лев',
    caption: 'Король саванны'
  },
  {
    image: 'https://i.pinimg.com/originals/41/22/52/412252433ee6dd88e048f83a97cc83de.jpg?nii=t',
    alt: 'Пингвин',
    caption: 'Антарктические жители'
  },
  {
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46',
    alt: 'Слон',
    caption: 'Гиганты Африки'
  },
  {
    image: 'https://images.unsplash.com/photo-1549366021-9f761d450615',
    alt: 'Жираф',
    caption: 'Высочайшие млекопитающие'
  },
  {
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c',
    alt: 'Тигр',
    caption: 'Полосатый хищник'
  },
  {
    image: 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2',
    alt: 'Дельфин',
    caption: 'Морские интеллектуалы'
  },
  {
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5',
    alt: 'Зебра',
    caption: 'Полосатая красавица'
  },
  {
    image: 'https://images.unsplash.com/photo-1501706362039-c6e80948f11f',
    alt: 'Медведь',
    caption: 'Хозяин леса'
  },
  {
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a',
    alt: 'Волк',
    caption: 'Свободный дух природы'
  },
  {
    image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e',
    alt: 'Фламинго',
    caption: 'Розовая грация'
  },
  {
    image: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5',
    alt: 'Леопард',
    caption: 'Быстрый охотник'
  },
  {
    image: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13',
    alt: 'Попугай',
    caption: 'Яркие краски джунглей'
  }
])

const visibleCount = ref(8)

const visibleGallery = computed(() =>
  galleryItems.value.slice(0, visibleCount.value)
)

const loadMore = () => {
  visibleCount.value += 8
}

const isOpen = ref(false)
const currentIndex = ref(0)

const currentItem = computed(
  () => visibleGallery.value[currentIndex.value] ?? null
)

const openLightbox = (index: number) => {
  currentIndex.value = index
  isOpen.value = true
  document.body.style.overflow = 'hidden'
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

// Режим удаления
const enableDeleteMode = () => {
  isDeleteMode.value = true
  selectedPhotos.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedPhotos.value = []
}

const toggleSelection = (index: number) => {
  const idx = selectedPhotos.value.indexOf(index)
  if (idx > -1) {
    selectedPhotos.value.splice(idx, 1)
  } else {
    selectedPhotos.value.push(index)
  }
}

const confirmDelete = () => {
  // Сортируем индексы по убыванию, чтобы удалять с конца
  const sortedIndexes = [...selectedPhotos.value].sort((a, b) => b - a)
  sortedIndexes.forEach(idx => {
    galleryItems.value.splice(idx, 1)
  })
  console.log('Удалено фото:', sortedIndexes)
  selectedPhotos.value = []
  isDeleteMode.value = false
}

// === EditModal: Секция ===
const openSectionEditModal = () => {
  isSectionEditModalOpen.value = true
}

const closeSectionEditModal = () => {
  isSectionEditModalOpen.value = false
}

const handleSectionEditSave = (values: Record<string, any>) => {
  if (values.sectionBadge !== undefined) sectionBadge.value = values.sectionBadge
  if (values.sectionTitle !== undefined) sectionTitle.value = values.sectionTitle
  if (values.sectionDescription !== undefined) sectionDescription.value = values.sectionDescription
  console.log('Сохранены изменения секции:', values)
}

// === EditModal: Фото ===
const openPhotoEditModal = (index: number) => {
  editingPhotoIndex.value = index
  isNewPhoto.value = false
  photoEditModalTitle.value = 'Редактирование фото'
  photoEditModalSubtitle.value = `Редактирование: ${galleryItems.value[index].caption}`
  isPhotoEditModalOpen.value = true
}

const openNewPhotoModal = () => {
  editingPhotoIndex.value = null
  isNewPhoto.value = true
  photoEditModalTitle.value = 'Добавить новое фото'
  photoEditModalSubtitle.value = 'Заполните данные нового изображения'
  isPhotoEditModalOpen.value = true
}

const closePhotoEditModal = () => {
  isPhotoEditModalOpen.value = false
  editingPhotoIndex.value = null
  isNewPhoto.value = false
}

const handlePhotoEditSave = (values: Record<string, any>) => {
  if (isNewPhoto.value) {
    // Добавление нового фото
    const newPhoto: GalleryItem = {
      image: values.image,
      alt: values.alt,
      caption: values.caption,
    }
    galleryItems.value.unshift(newPhoto)
    console.log('Добавлено новое фото:', newPhoto)
  } else if (editingPhotoIndex.value !== null) {
    // Обновление существующего фото
    const photo = galleryItems.value[editingPhotoIndex.value]
    if (photo) {
      photo.image = values.image
      photo.alt = values.alt
      photo.caption = values.caption
      console.log('Обновлено фото:', photo)
    }
  }
}

// Expose для родительского компонента
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

const handleKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') nextImage()
  if (e.key === 'ArrowLeft') prevImage()
}

onMounted(() => {
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