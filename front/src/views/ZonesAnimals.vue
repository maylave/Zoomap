<template>
  <section class="bg-forest-400 min-h-screen px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-12 text-center">
        <Header></Header>

        <!-- Admin Controls -->
        <div v-if="isAdmin" class="mt-6 flex justify-center gap-3">
          <button
            @click="toggleEditMode"
            class="rounded-full px-6 py-2 text-sm font-medium transition-all"
            :class="isEditMode 
              ? 'bg-terracotta text-white' 
              : 'bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30'"
          >
            <i class="fa-solid fa-pen-to-square mr-2"></i>
            {{ isEditMode ? 'Режим редактирования' : 'Редактировать карту' }}
          </button>
          <button
            @click="openAddZoneModal"
            class="rounded-full bg-accent px-6 py-2 text-sm font-medium text-forest-900 transition-all hover:bg-accent/90"
          >
            <i class="fa-solid fa-plus mr-2"></i>
            Добавить зону
          </button>
        </div>
      </div>

      <!-- Map Container -->
      <div class="relative mb-12">
        <!-- SVG Map -->
        <div class="relative w-full h-[600px] md:h-[700px] rounded-[2rem] bg-forest-300/30 border border-white/10 overflow-hidden backdrop-blur-sm">
          
          <!-- SVG Path -->
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#a8c96b;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#5c7a3e;stop-opacity:0.5" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <!-- Path Line -->
            <path
              d="M 100,350 Q 200,350 250,250 T 400,200 T 600,300 T 800,250 T 950,350"
              fill="none"
              stroke="url(#pathGradient)"
              stroke-width="8"
              stroke-dasharray="10,5"
              class="opacity-60"
            />
            
            <!-- Animated walking path -->
            <path
              d="M 100,350 Q 200,350 250,250 T 400,200 T 600,300 T 800,250 T 950,350"
              fill="none"
              stroke="#a8c96b"
              stroke-width="3"
              stroke-dasharray="10,10"
              filter="url(#glow)"
              class="animate-path"
            />
          </svg>

          <!-- Zone Markers -->
          <div
            v-for="(zone, index) in zones"
            :key="zone.id"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            :style="{
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`
            }"
            @click="handleZoneClick(zone)"
            :class="isEditMode ? 'cursor-move' : 'cursor-pointer'"
          >
            <!-- Marker Pulse -->
            <div
              class="absolute inset-0 rounded-full animate-ping"
              :class="selectedZone?.id === zone.id ? 'bg-accent' : 'bg-accent/50'"
              :style="{ animationDelay: `${index * 0.3}s` }"
            ></div>
            
            <!-- Marker Circle -->
            <div
              class="relative flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-xl transition-all duration-300 group-hover:scale-125"
              :class="selectedZone?.id === zone.id 
                ? 'bg-accent border-accent scale-110' 
                : 'bg-forest-400 border-white/30 hover:border-accent/60'"
            >
              <i class="fa-solid fa-location-dot text-2xl text-cream-100"></i>
            </div>

            <!-- Edit/Delete Buttons (in edit mode) -->
            <div v-if="isEditMode" class="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                @click.stop="openEditZoneModal(zone)"
                class="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-forest-900 shadow-lg hover:scale-110 transition-all"
                title="Редактировать"
              >
                <i class="fa-solid fa-pen text-xs"></i>
              </button>
              <button
                @click.stop="deleteZone(zone.id)"
                class="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-white shadow-lg hover:scale-110 transition-all"
                title="Удалить"
              >
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>

            <!-- Zone Label -->
            <div class="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div class="rounded-full bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10">
                <p class="text-sm font-bold text-cream-100">{{ zone.name }}</p>
              </div>
              <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-black/60"></div>
            </div>
          </div>

          <!-- Start Point -->
          <div class="absolute left-[5%] top-[50%] transform -translate-y-1/2">
            <div class="flex items-center gap-3 rounded-full bg-accent/90 px-6 py-3 shadow-lg">
              <i class="fa-solid fa-person-walking text-forest-900 text-xl"></i>
              <span class="font-bold text-forest-900">Вход</span>
            </div>
          </div>

          <!-- End Point -->
          <div class="absolute right-[5%] top-[50%] transform -translate-y-1/2">
            <div class="flex items-center gap-3 rounded-full bg-accent/90 px-6 py-3 shadow-lg">
              <span class="font-bold text-forest-900">Выход</span>
              <i class="fa-solid fa-flag-checkered text-forest-900 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-6 flex flex-wrap justify-center gap-6">
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded-full bg-accent"></div>
            <span class="text-sm text-cream-100/70">Активная зона</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded-full bg-forest-400 border-2 border-white/30"></div>
            <span class="text-sm text-cream-100/70">Доступная зона</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-1 w-8" style="background-image: repeating-linear-gradient(90deg, #a8c96b 0, #a8c96b 6px, transparent 6px, transparent 10px);"></div>
            <span class="text-sm text-cream-100/70">Маршрут</span>
          </div>
        </div>
      </div>

      <!-- Zone Details Panel -->
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Selected Zone Info -->
        <div
          v-if="selectedZone"
          class="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
        >
          <div class="flex items-start justify-between mb-6">
            <div>
              <h3 class="text-3xl font-bold text-cream-100 mb-2">{{ selectedZone.name }}</h3>
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-sm text-accent border border-accent/30">
                  <i class="fa-solid fa-location-dot"></i>
                  {{ selectedZone.location }}
                </span>
                <span class="text-cream-100/60 text-sm">{{ selectedZone.animals.length }} видов</span>
              </div>
            </div>
            <button
              @click="selectedZone = null"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream-100/60 hover:bg-white/20 transition-all"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <img
            :src="selectedZone.image"
            :alt="selectedZone.name"
            class="w-full h-48 object-cover rounded-2xl mb-6"
          />

          <p class="text-cream-100/70 leading-relaxed mb-6">
            {{ selectedZone.description }}
          </p>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="rounded-xl bg-white/5 p-4 border border-white/10">
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-temperature-half text-accent"></i>
                <span class="text-sm text-cream-100/60">Климат</span>
              </div>
              <p class="font-semibold text-cream-100">{{ selectedZone.climate }}</p>
            </div>
            <div class="rounded-xl bg-white/5 p-4 border border-white/10">
              <div class="flex items-center gap-2 mb-2">
                <i class="fa-solid fa-clock text-accent"></i>
                <span class="text-sm text-cream-100/60">Режим работы</span>
              </div>
              <p class="font-semibold text-cream-100">{{ selectedZone.hours }}</p>
            </div>
          </div>

          <div>
            <p class="text-sm font-semibold text-cream-100/80 mb-3">Обитатели:</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="animal in selectedZone.animals"
                :key="animal"
                class="rounded-full bg-white/10 px-4 py-2 text-sm text-cream-100 border border-white/10"
              >
                {{ animal }}
              </span>
            </div>
          </div>

          <!-- View Details Button -->
          <button
            @click="goToZonePage(selectedZone)"
            class="mt-6 w-full rounded-xl bg-accent px-6 py-4 font-bold text-forest-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/30"
          >
            <i class="fa-solid fa-arrow-right mr-2"></i>
            Перейти на страницу зоны
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="space-y-4">
          <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h4 class="text-lg font-bold text-cream-100 mb-4">Информация</h4>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-cream-100/60">Всего зон</span>
                <span class="text-2xl font-bold text-accent">{{ zones.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-cream-100/60">Животных</span>
                <span class="text-2xl font-bold text-accent">{{ totalAnimals }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-cream-100/60">Протяженность</span>
                <span class="text-2xl font-bold text-accent">2.5 км</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-cream-100/60">Время прохождения</span>
                <span class="text-2xl font-bold text-accent">3-4 часа</span>
              </div>
            </div>
          </div>

          <button class="w-full rounded-2xl bg-accent px-6 py-4 font-bold text-forest-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/30">
            Скачать карту PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal for Zone -->
    <EditModal
      :visible="isEditModalOpen"
      :title="editModalTitle"
      :subtitle="editModalSubtitle"
      :fields="editFields"
      @close="closeEditModal"
      @save="handleEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import EditModal from '@/components/overlay/EditModal.vue'
import Header from '@/components/header.vue'
const router = useRouter()

interface Zone {
  id: string
  name: string
  location: string
  image: string
  description: string
  climate: string
  hours: string
  animals: string[]
  position: {
    x: number
    y: number
  }
}

const isAdmin = ref(true)
const isEditMode = ref(false)
const selectedZone = ref<Zone | null>(null)
const isEditModalOpen = ref(false)
const editModalTitle = ref('Редактирование зоны')
const editModalSubtitle = ref('Измените данные зоны')
const editingZoneId = ref<string | null>(null)
const isNewZone = ref(false)

const zones = ref<Zone[]>([
  {
    id: '1',
    name: 'Африканская саванна',
    location: 'Зона 1',
    image: 'https://images.unsplash.com/photo-1516426122078-c63e227f0a02?w=800',
    description: 'Огромная территория с львами, слонами и жирафами в естественной среде обитания.',
    climate: 'Тёплый',
    hours: '9:00 – 19:00',
    animals: ['Лев', 'Слон', 'Жираф', 'Зебра', 'Носорог'],
    position: { x: 25, y: 35 }
  },
  {
    id: '2',
    name: 'Тропический лес',
    location: 'Зона 2',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc1af1428?w=800',
    description: 'Влажные тропики с тиграми, обезьянами и экзотическими птицами.',
    climate: 'Влажный',
    hours: '9:00 – 19:00',
    animals: ['Тигр', 'Леопард', 'Орангутан', 'Тукан'],
    position: { x: 40, y: 28 }
  },
  {
    id: '3',
    name: 'Океанариум',
    location: 'Зона 3',
    image: 'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?w=800',
    description: 'Подводный мир с акулами, дельфинами и скатами.',
    climate: 'Умеренный',
    hours: '10:00 – 20:00',
    animals: ['Дельфин', 'Акула', 'Скат', 'Морской котик'],
    position: { x: 60, y: 43 }
  },
  {
    id: '4',
    name: 'Арктическая зона',
    location: 'Зона 4',
    image: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800',
    description: 'Холодный климат для белых медведей и пингвинов.',
    climate: 'Холодный',
    hours: '9:00 – 18:00',
    animals: ['Белый медведь', 'Пингвин', 'Тюлень', 'Морж'],
    position: { x: 80, y: 35 }
  },
  {
    id: '5',
    name: 'Детский зоопарк',
    location: 'Зона 5',
    image: 'https://images.unsplash.com/photo-1564349683136-7cbe1274269a?w=800',
    description: 'Контактная зона с домашними животными.',
    climate: 'Умеренный',
    hours: '9:00 – 19:00',
    animals: ['Коза', 'Овца', 'Кролик', 'Пони'],
    position: { x: 95, y: 50 }
  }
])

const totalAnimals = computed(() => {
  return zones.value.reduce((acc, zone) => acc + zone.animals.length, 0)
})

const editFields = computed(() => {
  const zone = editingZoneId.value 
    ? zones.value.find(z => z.id === editingZoneId.value) 
    : null
  
  return [
    {
      key: 'name',
      label: 'Название зоны',
      value: zone?.name || '',
      placeholder: 'Например: Африканская саванна',
      required: true,
      icon: 'fa-solid fa-tag',
      type: 'text' as const,
    },
    {
      key: 'location',
      label: 'Расположение',
      value: zone?.location || '',
      placeholder: 'Например: Зона 1',
      required: true,
      icon: 'fa-solid fa-location-dot',
      type: 'text' as const,
    },
    {
      key: 'image',
      label: 'URL изображения',
      value: zone?.image || '',
      placeholder: 'https://example.com/photo.jpg',
      required: true,
      icon: 'fa-solid fa-image',
      type: 'url' as const,
    },
    {
      key: 'description',
      label: 'Описание',
      value: zone?.description || '',
      placeholder: 'Описание зоны',
      required: true,
      rows: 3,
      icon: 'fa-solid fa-align-left',
      type: 'textarea' as const,
    },
    {
      key: 'climate',
      label: 'Климат',
      value: zone?.climate || '',
      placeholder: 'Например: Тёплый',
      required: true,
      icon: 'fa-solid fa-temperature-half',
      type: 'text' as const,
    },
    {
      key: 'hours',
      label: 'Режим работы',
      value: zone?.hours || '',
      placeholder: 'Например: 9:00 – 19:00',
      required: true,
      icon: 'fa-solid fa-clock',
      type: 'text' as const,
    },
    {
      key: 'animals',
      label: 'Животные (через запятую)',
      value: zone?.animals.join(', ') || '',
      placeholder: 'Лев, Слон, Жираф',
      required: true,
      icon: 'fa-solid fa-paw',
      type: 'text' as const,
    },
    {
      key: 'positionX',
      label: 'Позиция X (%)',
      value: zone?.position.x || 50,
      placeholder: '25',
      required: true,
      hint: 'Горизонтальная позиция на карте (0-100)',
      icon: 'fa-solid fa-arrows-left-right',
      type: 'number' as const,
    },
    {
      key: 'positionY',
      label: 'Позиция Y (%)',
      value: zone?.position.y || 50,
      placeholder: '35',
      required: true,
      hint: 'Вертикальная позиция на карте (0-100)',
      icon: 'fa-solid fa-arrows-up-down',
      type: 'number' as const,
    },
  ]
})

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    selectedZone.value = null
  }
}

const handleZoneClick = (zone: Zone) => {
  if (isEditMode.value) {
    // В режиме редактирования - показать в панели
    selectedZone.value = zone
  } else {
    // В обычном режиме - перейти на страницу зоны
    goToZonePage(zone)
  }
}

const goToZonePage = (zone: Zone) => {
  // Переходим на страницу каталога с параметром зоны
  router.push({
    path: '/animals',
    query: { zone: zone.name }
  })
}

const openEditZoneModal = (zone: Zone) => {
  editingZoneId.value = zone.id
  isNewZone.value = false
  editModalTitle.value = 'Редактирование зоны'
  editModalSubtitle.value = `Редактирование: ${zone.name}`
  isEditModalOpen.value = true
}

const openAddZoneModal = () => {
  editingZoneId.value = null
  isNewZone.value = true
  editModalTitle.value = 'Добавить новую зону'
  editModalSubtitle.value = 'Заполните данные новой зоны'
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editingZoneId.value = null
  isNewZone.value = false
}

const handleEditSave = (values: Record<string, any>) => {
  const animalsArray = values.animals.split(',').map((a: string) => a.trim()).filter((a: string) => a)
  
  if (isNewZone.value) {
    // Добавление новой зоны
    const newZone: Zone = {
      id: Date.now().toString(),
      name: values.name,
      location: values.location,
      image: values.image,
      description: values.description,
      climate: values.climate,
      hours: values.hours,
      animals: animalsArray,
      position: {
        x: Number(values.positionX),
        y: Number(values.positionY)
      }
    }
    zones.value.push(newZone)
    console.log('Добавлена новая зона:', newZone)
  } else if (editingZoneId.value) {
    // Обновление существующей зоны
    const zone = zones.value.find(z => z.id === editingZoneId.value)
    if (zone) {
      zone.name = values.name
      zone.location = values.location
      zone.image = values.image
      zone.description = values.description
      zone.climate = values.climate
      zone.hours = values.hours
      zone.animals = animalsArray
      zone.position = {
        x: Number(values.positionX),
        y: Number(values.positionY)
      }
      console.log('Обновлена зона:', zone)
    }
  }
}

const deleteZone = (id: string) => {
  const zone = zones.value.find(z => z.id === id)
  if (zone && confirm(`Удалить зону "${zone.name}"?`)) {
    zones.value = zones.value.filter(z => z.id !== id)
    if (selectedZone.value?.id === id) {
      selectedZone.value = null
    }
    console.log('Удалена зона:', zone.name)
  }
}

const selectZone = (zone: Zone) => {
  selectedZone.value = zone
}
</script>

<style scoped>
@keyframes path {
  to {
    stroke-dashoffset: -1000;
  }
}

.animate-path {
  animation: path 20s linear infinite;
}
</style>