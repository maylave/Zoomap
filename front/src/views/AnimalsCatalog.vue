<template>
  <section class="bg-forest-400 min-h-screen px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <Header></Header>

      <!-- Warning Block (только для админа) -->
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
              Управление каталогом животных
            </p>
            <p class="text-cream-100/60 text-xs mt-0.5">
              Редактируйте карточки животных или добавляйте новые
            </p>
          </div>
        </div>

        <button
          class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-2 rounded-lg hover:bg-white/5"
          title="Редактировать секцию"
          @click="openSectionEditModal"
        >
          <i class="fa-solid fa-pen text-sm"></i>
        </button>
      </div>

      <!-- Панель удаления -->
      <div
        v-if="isDeleteMode && selectedAnimals.length > 0"
        class="mb-10 flex items-center justify-between rounded-2xl border border-terracotta/30 bg-terracotta/10 p-4 backdrop-blur-sm animate-fade-in"
      >
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta/20">
            <i class="fa-solid fa-trash text-terracotta"></i>
          </div>
          <div>
            <p class="text-cream-100 text-sm font-medium">
              Выбрано животных: {{ selectedAnimals.length }}
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

      <!-- Filters -->
      <div class="mb-10 flex flex-wrap justify-center gap-3">
        <button
          v-for="zone in allZones"
          :key="zone"
          @click="selectedZone = zone"
          class="rounded-full px-6 py-2 text-sm font-medium transition-all duration-200"
          :class="selectedZone === zone 
            ? 'bg-accent text-forest-900' 
            : 'bg-white/5 text-cream-100 border border-white/10 hover:bg-white/10'"
        >
          {{ zone }}
        </button>
      </div>

      <!-- Animals Grid -->
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(animal, index) in filteredAnimals"
          :key="animal.id"
          class="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20"
          :class="[
            isDeleteMode ? 'cursor-pointer' : 'cursor-pointer',
            { 'ring-4 ring-terracotta ring-offset-2 ring-offset-forest-400 scale-[0.98]': selectedAnimals.includes(animal.id) }
          ]"
          @click="isDeleteMode ? toggleSelection(animal.id) : openModal(animal)"
        >
          <!-- Чекбокс для удаления -->
          <div
            v-if="isDeleteMode"
            class="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border-2 bg-black/40 backdrop-blur-md transition-all duration-200 shadow-lg"
            :class="selectedAnimals.includes(animal.id) 
              ? 'border-terracotta bg-terracotta/30 scale-110' 
              : 'border-white/50 hover:border-white hover:bg-black/60'"
          >
            <i
              v-if="selectedAnimals.includes(animal.id)"
              class="fa-solid fa-check text-white text-sm"
            ></i>
          </div>

          <!-- Кнопка редактирования (только для админа и не в режиме удаления) -->
          <button
            v-if="isAdmin && !isDeleteMode"
            class="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-cream-100/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent/30 hover:text-accent hover:border-accent/40 hover:scale-110"
            title="Редактировать животное"
            @click.stop="openAnimalEditModal(animal.id)"
          >
            <i class="fa-solid fa-pen-to-square text-sm"></i>
          </button>

          <!-- Image -->
          <div class="relative h-64 overflow-hidden">
            <img
              :src="animal.image"
              :alt="animal.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              :class="{ 'group-hover:scale-100': isDeleteMode }"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <!-- Zone Badge -->
            <span class="absolute top-4 left-4 rounded-full bg-accent/90 px-3 py-1 text-xs font-bold text-forest-900"
              :class="{ 'left-16': isDeleteMode }">
              {{ animal.zone }}
            </span>
          </div>

          <!-- Content -->
          <div class="p-6">
            <h3 class="text-2xl font-bold text-cream-100">{{ animal.name }}</h3>
            <p class="mt-2 text-sm text-cream-100/60 line-clamp-2">{{ animal.description }}</p>
            
            <!-- Stats -->
            <div class="mt-4 flex items-center justify-between text-sm">
              <div class="flex items-center gap-2 text-cream-100/60">
                <i class="fa-solid fa-star text-accent"></i>
                <span>{{ animal.rating.toFixed(1) }}</span>
              </div>
              <div class="flex items-center gap-2 text-cream-100/60">
                <i class="fa-solid fa-comment"></i>
                <span>{{ animal.reviews.length }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Animal Card (только для админа и не в режиме удаления) -->
        <div
          v-if="isAdmin && !isDeleteMode"
          class="group/add flex min-h-[400px] cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-accent/50 hover:bg-accent/5 hover:shadow-2xl hover:shadow-black/20"
          @click="openNewAnimalModal"
        >
          <div
            class="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 transition-all duration-300 group-hover/add:bg-accent/20 group-hover/add:scale-110"
          >
            <i
              class="fa-solid fa-plus text-3xl text-cream-100/40 transition-colors duration-300 group-hover/add:text-accent"
            ></i>
          </div>
          <div class="text-center">
            <p class="text-cream-100 text-base font-medium">Добавить животное</p>
            <p class="text-cream-100/40 text-xs mt-1">Создать новую карточку</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredAnimals.length === 0" class="text-center py-20">
        <i class="fa-solid fa-paw text-6xl text-cream-100/20 mb-4"></i>
        <p class="text-cream-100/60 text-lg">В этой зоне пока нет животных</p>
        <button
          @click="selectedZone = 'Все зоны'"
          class="mt-6 rounded-full bg-accent px-6 py-3 font-bold text-forest-900 hover:bg-accent/90 transition-all"
        >
          Показать все зоны
        </button>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- FULL-SCREEN PRODUCT STYLE MODAL            -->
    <!-- ========================================== -->
    <Teleport to="body">
      <Transition name="modal-slide">
        <div
          v-if="isOpen && selectedAnimal"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <!-- Navigation Arrows -->
          <button
            @click="prevAnimal"
            :disabled="currentIndex === 0"
            class="absolute left-6 top-1/2 -translate-y-1/2 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-cream-100 border border-white/20 backdrop-blur-md hover:bg-accent hover:text-forest-900 hover:border-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/50 disabled:hover:text-cream-100"
          >
            <i class="fa-solid fa-chevron-left text-xl"></i>
          </button>

          <button
            @click="nextAnimal"
            :disabled="currentIndex === filteredAnimals.length - 1"
            class="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-cream-100 border border-white/20 backdrop-blur-md hover:bg-accent hover:text-forest-900 hover:border-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black/50 disabled:hover:text-cream-100"
          >
            <i class="fa-solid fa-chevron-right text-xl"></i>
          </button>

          <!-- Close Button (Global) -->
          <button
            @click="closeModal"
            class="absolute top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>

          <!-- Modal Container -->
          <div class="relative w-full h-[90vh] max-w-7xl mx-4 md:mx-0 bg-forest-400 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row">
            
            <!-- LEFT: Photo Gallery Area -->
            <div class="relative w-full md:w-[55%] bg-black/40 flex items-center justify-center group overflow-hidden">
              <img 
                :src="selectedAnimal.image" 
                :alt="selectedAnimal.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              <div class="absolute inset-0 bg-gradient-to-t from-forest-400 via-transparent to-transparent md:bg-gradient-to-r" />
              
              <button class="absolute top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white border border-white/20 hover:bg-accent hover:text-forest-900 transition-all">
                <i class="fa-regular fa-heart text-xl"></i>
              </button>
            </div>

            <!-- RIGHT: Info Scrollable Area -->
            <div class="w-full md:w-[45%] flex flex-col h-full">
              
              <!-- Scrollable Content -->
              <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                
                <!-- Title & Rating -->
                <div class="mb-6">
                  <h2 class="text-4xl font-bold text-cream-100 leading-tight mb-2">
                    {{ selectedAnimal.name }}
                  </h2>
                  <p class="text-accent text-lg font-medium mb-4 italic">{{ selectedAnimal.scientificName }}</p>
                  
                  <div class="flex items-center gap-4">
                    <div class="flex text-accent gap-0.5">
                      <i v-for="i in 5" :key="i" class="fa-solid fa-star" :class="i <= Math.round(selectedAnimal.rating) ? '' : 'opacity-20'"></i>
                    </div>
                    <span class="text-cream-100/60 text-sm">{{ selectedAnimal.rating.toFixed(1) }} ({{ selectedAnimal.reviews.length }} отзывов)</span>
                  </div>
                </div>

                <!-- Characteristics Grid -->
                <div class="grid grid-cols-2 gap-4 mb-8">
                  <div class="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <span class="text-xs text-cream-100/40 uppercase tracking-wider">Питание</span>
                    <p class="text-lg font-semibold text-cream-100 mt-1">{{ selectedAnimal.diet }}</p>
                  </div>
                  <div class="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <span class="text-xs text-cream-100/40 uppercase tracking-wider">Вес</span>
                    <p class="text-lg font-semibold text-cream-100 mt-1">{{ selectedAnimal.weight }}</p>
                  </div>
                  <div class="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <span class="text-xs text-cream-100/40 uppercase tracking-wider">Возраст</span>
                    <p class="text-lg font-semibold text-cream-100 mt-1">{{ selectedAnimal.age }}</p>
                  </div>
                  <div class="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <span class="text-xs text-cream-100/40 uppercase tracking-wider">Зона</span>
                    <p class="text-lg font-semibold text-cream-100 mt-1">{{ selectedAnimal.zone }}</p>
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-10">
                  <h3 class="text-xl font-bold text-cream-100 mb-3">О животном</h3>
                  <p class="text-cream-100/70 leading-relaxed text-lg">
                    {{ selectedAnimal.description }}
                  </p>
                </div>

                <!-- Reviews Section -->
                <div class="mb-24">
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-cream-100">Отзывы</h3>
                    <span class="text-sm text-cream-100/50">{{ selectedAnimal.reviews.length }} записей</span>
                  </div>

                  <!-- Review List -->
                  <div class="space-y-6">
                    <div 
                      v-for="review in selectedAnimal.reviews" 
                      :key="review.id" 
                      class="p-4 rounded-2xl border border-white/10 bg-white/5"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-cream-100">{{ review.author }}</span>
                        <span class="text-xs text-cream-100/40">{{ formatDate(review.date) }}</span>
                      </div>
                      <div class="flex text-accent text-xs mb-2 gap-0.5">
                        <i v-for="i in 5" :key="i" class="fa-solid fa-star" :class="i <= review.rating ? '' : 'opacity-20'"></i>
                      </div>
                      <p class="text-sm text-cream-100/80">{{ review.text }}</p>
                    </div>
                  </div>

                  <!-- Add Review Form -->
                  <div class="mt-8 p-6 rounded-2xl border border-accent/30 bg-accent/5">
                    <h4 class="text-lg font-bold text-cream-100 mb-4">Оставить отзыв</h4>
                    <form @submit.prevent="submitReview" class="space-y-4">
                      <input 
                        v-model="newReview.author"
                        type="text"
                        placeholder="Ваше имя"
                        class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-cream-100 outline-none focus:border-accent"
                        required
                      />
                      <div class="flex gap-2">
                        <button 
                          v-for="r in 5" 
                          :key="r"
                          type="button"
                          @click="newReview.rating = r"
                          class="text-2xl transition-all hover:scale-125"
                          :class="r <= newReview.rating ? 'text-accent' : 'text-cream-100/20'"
                        >
                          <i class="fa-solid fa-star"></i>
                        </button>
                      </div>
                      <textarea 
                        v-model="newReview.text"
                        placeholder="Расскажите о впечатлениях..."
                        rows="3"
                        class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-cream-100 outline-none focus:border-accent resize-none"
                        required
                      ></textarea>
                      <button 
                        type="submit"
                        class="w-full bg-accent text-forest-900 font-bold py-3 rounded-xl hover:bg-accent/90 transition-all"
                      >
                        Опубликовать
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <!-- Sticky Action Bar (Bottom) -->
              <div class="p-6 border-t border-white/10 bg-forest-400/90 backdrop-blur-xl sticky bottom-0">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p class="text-sm text-cream-100/60">Входной билет</p>
                    <p class="text-2xl font-bold text-cream-100">Включено в билет</p>
                  </div>
                  <button class="bg-accent text-forest-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-accent/20">
                    Забронировать встречу
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Counter -->
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-cream-100 px-6 py-3 rounded-full text-sm font-medium border border-white/10">
            {{ currentIndex + 1 }} из {{ filteredAnimals.length }}
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- EditModal для секции -->
    <EditModal
      :visible="isSectionEditModalOpen"
      title="Редактирование секции"
      subtitle="Измените заголовок и описание каталога"
      :fields="sectionEditFields"
      @close="closeSectionEditModal"
      @save="handleSectionEditSave"
    />

    <!-- EditModal для животного -->
    <EditModal
      :visible="isAnimalEditModalOpen"
      :title="animalEditModalTitle"
      :subtitle="animalEditModalSubtitle"
      :fields="animalEditFields"
      @close="closeAnimalEditModal"
      @save="handleAnimalEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditModal from '@/components/overlay/EditModal.vue'
import Header from '@/components/header.vue'
// Types
interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
}

interface Animal {
  id: string
  name: string
  scientificName: string
  zone: string
  image: string
  description: string
  diet: string
  weight: string
  age: string
  lifespan: string
  rating: number
  reviews: Review[]
}

// Router
const route = useRoute()
const router = useRouter()

// Admin state
const isAdmin = ref(true)
const isDeleteMode = ref(false)
const selectedAnimals = ref<string[]>([])

// Section editable texts
const sectionBadge = ref('Каталог обитателей')
const sectionTitlePart1 = ref('Наши')
const sectionTitlePart2 = ref('животные')
const sectionDescription = ref('Изучайте виды, читайте отзывы посетителей и планируйте свою встречу с дикой природой.')

// Section edit modal state
const isSectionEditModalOpen = ref(false)

// Animal edit modal state
const isAnimalEditModalOpen = ref(false)
const animalEditModalTitle = ref('Редактирование животного')
const animalEditModalSubtitle = ref('Измените данные животного')
const editingAnimalId = ref<string | null>(null)
const isNewAnimal = ref(false)

// State
const selectedZone = ref<string>('Все зоны')
const isOpen = ref(false)
const currentIndex = ref(0)
const selectedAnimal = ref<Animal | null>(null)

const newReview = ref({
  author: '',
  rating: 5,
  text: ''
})

// Data
const animals = ref<Animal[]>([
  {
    id: '1',
    name: 'Симба',
    scientificName: 'Panthera leo',
    zone: 'Африканская саванна',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800',
    description: 'Царь зверей, majestic лев с густой гривой. Симба — наш самый популярный обитатель, который любит позировать перед посетителями. Обладает невероятной харизмой.',
    diet: 'Хищник',
    weight: '190 кг',
    age: '7 лет',
    lifespan: '15-20 лет',
    rating: 4.8,
    reviews: [
      {
        id: 'r1',
        author: 'Анна М.',
        rating: 5,
        text: 'Невероятно красивый лев! Когда он рычал, мурашки по коже. Обязательно приходите на кормление!',
        date: '2024-01-15'
      }
    ]
  },
  {
    id: '2',
    name: 'Луна',
    scientificName: 'Loxodonta africana',
    zone: 'Африканская саванна',
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800',
    description: 'Мудрая африканская слониха. Луна обожает купаться и играть с водой. Очень дружелюбная и умная.',
    diet: 'Травоядное',
    weight: '4500 кг',
    age: '25 лет',
    lifespan: '60-70 лет',
    rating: 4.9,
    reviews: []
  },
  {
    id: '3',
    name: 'Полосатик',
    scientificName: 'Panthera tigris',
    zone: 'Тропический лес',
    image: 'https://images.unsplash.com/photo-1501706362039-c6e80948f11f?w=800',
    description: 'Бенгальский тигр с уникальным окрасом. Полосатик очень активен и любит плавать.',
    diet: 'Хищник',
    weight: '220 кг',
    age: '5 лет',
    lifespan: '20-25 лет',
    rating: 4.7,
    reviews: []
  },
  {
    id: '4',
    name: 'Пингвины',
    scientificName: 'Spheniscidae',
    zone: 'Арктическая зона',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
    description: 'Весёлая колония пингвинов Гумбольдта. Обожают нырять и ловить рыбу.',
    diet: 'Рыбоядное',
    weight: '4-6 кг',
    age: '3-8 лет',
    lifespan: '20 лет',
    rating: 4.6,
    reviews: []
  },
  {
    id: '5',
    name: 'Жираф София',
    scientificName: 'Giraffa camelopardalis',
    zone: 'Африканская саванна',
    image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
    description: 'Самая высокая обитательница зоопарка. София очень грациозна и любопытна.',
    diet: 'Травоядное',
    weight: '800 кг',
    age: '6 лет',
    lifespan: '25 лет',
    rating: 4.9,
    reviews: []
  },
  {
    id: '6',
    name: 'Дельфины',
    scientificName: 'Delphinidae',
    zone: 'Океанариум',
    image: 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=800',
    description: 'Умные и игривые афалины. Ежедневно проходят шоу-программы.',
    diet: 'Рыбоядное',
    weight: '150-200 кг',
    age: '5-12 лет',
    lifespan: '40-50 лет',
    rating: 5.0,
    reviews: []
  }
])

// Computed
const allZones = computed<string[]>(() => {
  const zones = new Set(animals.value.map((a: Animal) => a.zone))
  return ['Все зоны', ...Array.from(zones)]
})

const filteredAnimals = computed<Animal[]>(() => {
  if (selectedZone.value === 'Все зоны') return animals.value
  return animals.value.filter((a: Animal) => a.zone === selectedZone.value)
})

// Поля для редактирования секции
const sectionEditFields = computed(() => [
  {
    key: 'sectionBadge',
    label: 'Бейдж секции',
    value: sectionBadge.value,
    placeholder: 'Например: Каталог обитателей',
    hint: 'Маленький текст над заголовком',
    icon: 'fa-solid fa-tag',
    type: 'text' as const,
  },
  {
    key: 'sectionTitlePart1',
    label: 'Заголовок (часть 1)',
    value: sectionTitlePart1.value,
    placeholder: 'Первая часть заголовка',
    required: true,
    icon: 'fa-solid fa-heading',
    type: 'text' as const,
  },
  {
    key: 'sectionTitlePart2',
    label: 'Заголовок (часть 2 - акцентная)',
    value: sectionTitlePart2.value,
    placeholder: 'Вторая часть заголовка (выделена цветом)',
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

// Поля для редактирования животного
const animalEditFields = computed(() => {
  const animal = editingAnimalId.value 
    ? animals.value.find(a => a.id === editingAnimalId.value) 
    : null
  
  return [
    {
      key: 'name',
      label: 'Имя животного',
      value: animal?.name || '',
      placeholder: 'Например: Симба',
      required: true,
      icon: 'fa-solid fa-paw',
      type: 'text' as const,
    },
    {
      key: 'scientificName',
      label: 'Научное название',
      value: animal?.scientificName || '',
      placeholder: 'Например: Panthera leo',
      required: true,
      icon: 'fa-solid fa-flask',
      type: 'text' as const,
    },
    {
      key: 'zone',
      label: 'Зона',
      value: animal?.zone || '',
      placeholder: 'Например: Африканская саванна',
      required: true,
      hint: 'Должна совпадать с одной из существующих зон',
      icon: 'fa-solid fa-location-dot',
      type: 'text' as const,
    },
    {
      key: 'image',
      label: 'URL изображения',
      value: animal?.image || '',
      placeholder: 'https://example.com/photo.jpg',
      required: true,
      icon: 'fa-solid fa-image',
      type: 'url' as const,
    },
    {
      key: 'description',
      label: 'Описание',
      value: animal?.description || '',
      placeholder: 'Подробное описание животного',
      required: true,
      rows: 4,
      icon: 'fa-solid fa-align-left',
      type: 'textarea' as const,
    },
    {
      key: 'diet',
      label: 'Питание',
      value: animal?.diet || '',
      placeholder: 'Например: Хищник',
      required: true,
      icon: 'fa-solid fa-utensils',
      type: 'text' as const,
    },
    {
      key: 'weight',
      label: 'Вес',
      value: animal?.weight || '',
      placeholder: 'Например: 190 кг',
      required: true,
      icon: 'fa-solid fa-weight-scale',
      type: 'text' as const,
    },
    {
      key: 'age',
      label: 'Возраст',
      value: animal?.age || '',
      placeholder: 'Например: 7 лет',
      required: true,
      icon: 'fa-solid fa-calendar',
      type: 'text' as const,
    },
    {
      key: 'lifespan',
      label: 'Продолжительность жизни',
      value: animal?.lifespan || '',
      placeholder: 'Например: 15-20 лет',
      required: true,
      icon: 'fa-solid fa-hourglass-half',
      type: 'text' as const,
    },
  ]
})

// 🔑 Чтение query-параметра при загрузке страницы
onMounted(() => {
  const zoneFromQuery = route.query.zone as string
  if (zoneFromQuery && allZones.value.includes(zoneFromQuery)) {
    selectedZone.value = zoneFromQuery
  }
})

// 🔑 Следим за изменением query
watch(
  () => route.query.zone,
  (newZone) => {
    if (newZone && allZones.value.includes(newZone as string)) {
      selectedZone.value = newZone as string
    } else {
      selectedZone.value = 'Все зоны'
    }
  }
)

// 🔑 Обновляем URL при смене фильтра
watch(selectedZone, (newZone) => {
  const query: Record<string, string> = {}
  if (newZone !== 'Все зоны') {
    query.zone = newZone
  }
  router.replace({ query })
})

// === Delete Mode ===
const enableDeleteMode = () => {
  isDeleteMode.value = true
  selectedAnimals.value = []
}

const cancelDeleteMode = () => {
  isDeleteMode.value = false
  selectedAnimals.value = []
}

const toggleSelection = (id: string) => {
  const idx = selectedAnimals.value.indexOf(id)
  if (idx > -1) {
    selectedAnimals.value.splice(idx, 1)
  } else {
    selectedAnimals.value.push(id)
  }
}

const confirmDelete = () => {
  animals.value = animals.value.filter(a => !selectedAnimals.value.includes(a.id))
  console.log('Удалены животные:', selectedAnimals.value)
  selectedAnimals.value = []
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
  if (values.sectionTitlePart1 !== undefined) sectionTitlePart1.value = values.sectionTitlePart1
  if (values.sectionTitlePart2 !== undefined) sectionTitlePart2.value = values.sectionTitlePart2
  if (values.sectionDescription !== undefined) sectionDescription.value = values.sectionDescription
  console.log('Сохранены изменения секции:', values)
}

// === EditModal: Животное ===
const openAnimalEditModal = (id: string) => {
  editingAnimalId.value = id
  isNewAnimal.value = false
  animalEditModalTitle.value = 'Редактирование животного'
  const animal = animals.value.find(a => a.id === id)
  animalEditModalSubtitle.value = `Редактирование: ${animal?.name || ''}`
  isAnimalEditModalOpen.value = true
}

const openNewAnimalModal = () => {
  editingAnimalId.value = null
  isNewAnimal.value = true
  animalEditModalTitle.value = 'Добавить новое животное'
  animalEditModalSubtitle.value = 'Заполните данные нового животного'
  isAnimalEditModalOpen.value = true
}

const closeAnimalEditModal = () => {
  isAnimalEditModalOpen.value = false
  editingAnimalId.value = null
  isNewAnimal.value = false
}

const handleAnimalEditSave = (values: Record<string, any>) => {
  if (isNewAnimal.value) {
    // Добавление нового животного
    const newAnimal: Animal = {
      id: Date.now().toString(),
      name: values.name,
      scientificName: values.scientificName,
      zone: values.zone,
      image: values.image,
      description: values.description,
      diet: values.diet,
      weight: values.weight,
      age: values.age,
      lifespan: values.lifespan,
      rating: 0,
      reviews: [],
    }
    animals.value.push(newAnimal)
    console.log('Добавлено новое животное:', newAnimal)
  } else if (editingAnimalId.value) {
    // Обновление существующего
    const animal = animals.value.find(a => a.id === editingAnimalId.value)
    if (animal) {
      animal.name = values.name
      animal.scientificName = values.scientificName
      animal.zone = values.zone
      animal.image = values.image
      animal.description = values.description
      animal.diet = values.diet
      animal.weight = values.weight
      animal.age = values.age
      animal.lifespan = values.lifespan
      console.log('Обновлено животное:', animal)
    }
  }
}

// Expose для родительского компонента
defineExpose({
  isDeleteMode,
  enableDeleteMode,
  cancelDeleteMode,
})

// === Modal Methods ===
const openModal = (animal: Animal) => {
  const index = filteredAnimals.value.findIndex(a => a.id === animal.id)
  currentIndex.value = index
  selectedAnimal.value = filteredAnimals.value[index]
  isOpen.value = true
  newReview.value = { author: '', rating: 5, text: '' }
}

const closeModal = () => {
  isOpen.value = false
  selectedAnimal.value = null
}

const prevAnimal = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    selectedAnimal.value = filteredAnimals.value[currentIndex.value]
    newReview.value = { author: '', rating: 5, text: '' }
  }
}

const nextAnimal = () => {
  if (currentIndex.value < filteredAnimals.length - 1) {
    currentIndex.value++
    selectedAnimal.value = filteredAnimals.value[currentIndex.value]
    newReview.value = { author: '', rating: 5, text: '' }
  }
}

const submitReview = () => {
  if (!selectedAnimal.value) return
  
  const review: Review = {
    id: Date.now().toString(),
    author: newReview.value.author,
    rating: newReview.value.rating,
    text: newReview.value.text,
    date: new Date().toISOString().split('T')[0]
  }
  
  selectedAnimal.value.reviews.unshift(review)
  
  const totalRating = selectedAnimal.value.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0)
  selectedAnimal.value.rating = totalRating / selectedAnimal.value.reviews.length
  
  newReview.value = { author: '', rating: 5, text: '' }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 201, 107, 0.3);
  border-radius: 10px;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: opacity 0.3s ease;
}

.modal-slide-enter-active .modal-content,
.modal-slide-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
}

.modal-slide-enter-from .modal-content,
.modal-slide-leave-to .modal-content {
  transform: translateY(50px) scale(0.95);
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