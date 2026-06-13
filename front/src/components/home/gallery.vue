<template>
  <section id="gallery" class="bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-14">
        <span
          class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent"
        >
          Фотогалерея
        </span>

        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
          Живые моменты
        </h2>

        <p class="mt-4 max-w-xl text-cream-100/60">
          Каждый день — новые истории. Загляните в нашу галерею и почувствуйте
          атмосферу ZooVerse.
        </p>
      </div>

      <!-- Masonry Grid -->
      <div
        class="
          columns-1
          sm:columns-2
          lg:columns-3
          xl:columns-4
          gap-5
        "
      >
        <div
          v-for="(item, index) in visibleGallery"
          :key="index"
          class="
            group
            relative
            mb-5
            break-inside-avoid
            overflow-hidden
            rounded-3xl
            cursor-pointer
          "
          @click="openLightbox(index)"
        >
          <img
            :src="item.image"
            :alt="item.alt"
            loading="lazy"
            class="
              w-full
              h-auto
              rounded-3xl
              transition-transform
              duration-500
              group-hover:scale-105
            "
          >

          <!-- Overlay -->
          <div
            class="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/40
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          >
            <svg
              class="h-12 w-12 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </div>

          <!-- Caption -->
          <div
            class="
              absolute
              bottom-0
              left-0
              right-0
              bg-gradient-to-t
              from-black/80
              to-transparent
              p-4
            "
          >
            <p class="text-sm font-medium text-white">
              {{ item.caption }}
            </p>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div
        v-if="visibleCount < galleryItems.length"
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
          v-if="isOpen"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-6"
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
            class="
              absolute
              bottom-8
              rounded-xl
              bg-black/50
              px-5
              py-3
              text-white
              backdrop-blur
            "
          >
            {{ currentItem.caption }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>


<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref
} from 'vue'

import type { GalleryItem } from '@/types/gallery'

const galleryItems = ref<GalleryItem[]>([
  {
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d',
    alt: 'Лев',
    caption: 'Король саванны'
  },
  {
    image: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7',
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
  () => visibleGallery.value[currentIndex.value]
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
</style>