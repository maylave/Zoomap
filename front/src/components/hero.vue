<template>
  <section
    ref="heroRef"
    class="bg-forest-200 text-cream-100 group relative flex min-h-screen items-center overflow-hidden"
    @mousemove="handleGlobalMouseMove"
  >
    <!-- 1. Основной яркий курсор -->
    <div
      class="bg-lime/40 pointer-events-none absolute z-0 h-[300px] w-[300px] rounded-full mix-blend-screen blur-[60px] transition-transform duration-75 ease-out will-change-transform"
      :style="{
        left: '-150px',
        top: '-150px',
        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
      }"
    />

    <!-- 2. Спутник 1 -->
    <div
      class="pointer-events-none absolute z-0 h-[120px] w-[120px] rounded-full bg-emerald-400/30 mix-blend-screen blur-[40px] transition-transform duration-150 ease-out will-change-transform"
      :style="{
        left: '-60px',
        top: '-60px',
        transform: `translate(${satellite1.x}px, ${satellite1.y}px)`,
      }"
    />

    <!-- 3. Спутник 2 -->
    <div
      class="pointer-events-none absolute z-0 h-[80px] w-[80px] rounded-full bg-lime-200/40 mix-blend-screen blur-[30px] transition-transform duration-200 ease-out will-change-transform"
      :style="{
        left: '-40px',
        top: '-40px',
        transform: `translate(${satellite2.x}px, ${satellite2.y}px)`,
      }"
    />

    <!-- Фоновые статические пятна -->
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        class="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]"
      />
    </div>

    <!-- ✅ Блок предупреждения (только для админа из store) -->
    <div
      v-if="authStore.isAdmin"
      class="group/warning absolute top-6 left-6 z-50 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-3 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15 max-w-sm"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
          <i class="fa-solid fa-triangle-exclamation text-warning text-sm"></i>
        </div>
        <div>
          <p class="text-cream-100 text-xs font-medium">
            Управление Hero секцией
          </p>
          <p class="text-cream-100/60 text-[10px] mt-0.5">
            Редактируйте текст и элементы
          </p>
        </div>
      </div>

      <button
        class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-1.5 rounded-lg hover:bg-white/5"
        title="Редактировать Hero"
        @click="openEditModal"
      >
        <i class="fa-solid fa-pen text-xs"></i>
      </button>
    </div>

    <div
      class="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8"
    >
      <!-- Content -->
      <div class="flex flex-col items-start space-y-8">
        <!-- Бейдж -->
        <div
          class="border-lime/20 bg-lime/5 text-lime inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(168,201,107,0.1)] backdrop-blur-md"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="bg-lime absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            ></span>
            <span class="bg-lime relative inline-flex h-2 w-2 rounded-full"></span>
          </span>
          {{ badgeText }}
        </div>

        <!-- Заголовок -->
        <h1
          class="font-serif text-5xl leading-[1.1] font-black tracking-tight drop-shadow-lg lg:text-7xl"
        >
          {{ titleLine1 }}
          <br />
          <span
            class="from-lime bg-gradient-to-r to-emerald-400 bg-clip-text text-transparent italic"
          >
            {{ titleLine2 }}
          </span>
          <br />
          {{ titleLine3 }}
        </h1>

        <!-- Описание -->
        <p class="text-cream-100/70 max-w-xl text-lg leading-relaxed">
          {{ description }}
        </p>

        <!-- Кнопки -->
        <div class="flex flex-wrap gap-4 pt-4">
          <button
            @click="openAnimalModal('lion')"
            class="group bg-lime text-forest-900 relative overflow-hidden rounded-full px-8 py-4 font-bold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,201,107,0.6)]"
          >
            <span class="relative z-10 flex items-center gap-2">
              {{ buttonText1 }}
              <svg
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </button>

          <button
            class="text-cream-100 group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 font-medium backdrop-blur-sm transition-all hover:bg-white/10"
            @click="openVirtualTour()"
          >
            <span
              class="group-hover:border-lime/50 group-hover:bg-lime/10 flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors"
            >
              <svg
                class="text-cream-100 group-hover:text-lime ml-0.5 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            {{ buttonText2 }}
          </button>
        </div>
      </div>

      <!-- Visual with Parallax & Internal Glow -->
      <div class="perspective-1000 relative hidden items-center justify-center lg:flex">
        <div
          ref="cardRef"
          class="preserve-3d relative h-[500px] w-[360px] cursor-pointer transition-transform duration-100 ease-out"
          :style="cardStyle"
          @mousemove.stop="handleCardMouseMove"
          @mouseleave="handleCardMouseLeave"
          @click="openAnimalModal('lion')"
        >
          <!-- Main Card -->
          <div
            class="from-moss/40 to-forest-300/40 absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br shadow-2xl backdrop-blur-xl"
          >
            <!-- Внутренний свет карточки -->
            <div
              class="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-overlay transition-opacity duration-300"
              :style="{
                background: `radial-gradient(600px circle at ${cardMouse.x}px ${cardMouse.y}px, rgba(168, 201, 107, 0.25), transparent 40%)`,
              }"
            ></div>

            <!-- SVG Lion Icon -->
            <div
              class="absolute inset-0 z-10 flex items-center justify-center brightness-110 drop-shadow-2xl filter transition-transform duration-500 select-none group-hover:scale-110"
            >
              <AppIcon name="lion" class="text-lime/90 h-64 w-64" />
            </div>

            <div
              class="from-forest-900 absolute inset-0 z-10 bg-gradient-to-t via-transparent to-transparent opacity-80"
            />

            <!-- Бейдж -->
            <div
              class="border-lime/30 text-lime absolute top-6 left-6 z-20 flex items-center gap-1.5 rounded-full border bg-black/40 px-4 py-1.5 text-xs font-bold tracking-wider uppercase backdrop-blur-md"
            >
              <svg class="text-lime h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              {{ cardBadge }}
            </div>

            <!-- Информация о животном -->
            <div class="absolute right-8 bottom-8 left-8 z-20">
              <h3 class="mb-1 font-serif text-4xl font-bold text-white">{{ animalName }}</h3>
              <p class="text-cream-100/60 text-sm font-medium">{{ animalInfo }}</p>
            </div>
          </div>

          <!-- Floating Badges -->
          <div
            class="float text-forest-400 absolute top-10 -right-12 z-30 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-md"
          >
            <div class="bg-forest-100 rounded-full p-2">
              <AppIcon name="paw" class="text-forest-400 h-6 w-6" />
            </div>
            <div>
              <div class="font-serif text-2xl leading-none font-bold">{{ statsAnimals }}</div>
              <div class="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                животных
              </div>
            </div>
          </div>

          <div
            class="float-delay text-forest-400 absolute bottom-20 -left-12 z-30 flex items-center gap-3 rounded-2xl border border-white/50 bg-white/90 px-5 py-4 shadow-xl backdrop-blur-md"
          >
            <div class="bg-forest-100 rounded-full p-2">
              <AppIcon name="globe" class="text-forest-400 h-6 w-6" />
            </div>
            <div>
              <div class="font-serif text-2xl leading-none font-bold">{{ statsContinents }}</div>
              <div class="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                континентов
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Component для животных -->
    <AnimalModal :visible="isModalOpen" :animal-id="selectedAnimalId" @close="closeAnimalModal" />

    <!-- Universal Edit Modal -->
    <EditModal
      :visible="isEditModalOpen"
      title="Редактирование Hero секции"
      subtitle="Измените текстовые элементы и параметры"
      :fields="editFields"
      @close="closeEditModal"
      @save="handleEditSave"
    />
  </section>
</template>

<script setup lang="ts">
import AnimalModal from '@/components/overlay/AnimalModal.vue'
import EditModal from '@/components/overlay/EditModal.vue'
import AppIcon from '@/components/ui/BaseIcon.vue'
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

// ✅ Используем authStore вместо хардкода
const authStore = useAuthStore()

// State for Edit Modal
const isEditModalOpen = ref(false)

// Editable fields
const badgeText = ref('Открыто каждый день')
const titleLine1 = ref('Мир дикой')
const titleLine2 = ref('природы')
const titleLine3 = ref('у твоих ног')
const description = ref('ZooVerse — живое путешествие по пяти континентам без перелётов. Более 3 000 животных, интерактивные зоны и незабываемые впечатления для всей семьи.')
const buttonText1 = ref('Познакомиться с животными')
const buttonText2 = ref('Виртуальный тур')
const cardBadge = ref('Звезда сезона')
const animalName = ref('Симба')
const animalInfo = ref('Африканский лев · Зона Саванна')
const statsAnimals = ref('3000+')
const statsContinents = ref('5')

// Dynamic fields for EditModal
const editFields = computed(() => [
  {
    key: 'badgeText',
    label: 'Бейдж статуса',
    type: 'text' as const,
    value: badgeText.value,
    placeholder: 'Например: Открыто каждый день',
    hint: 'Текст в верхнем левом бейдже',
    icon: 'fa-solid fa-tag',
  },
  {
    key: 'titleLine1',
    label: 'Заголовок (строка 1)',
    type: 'text' as const,
    value: titleLine1.value,
    placeholder: 'Первая строка заголовка',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'titleLine2',
    label: 'Заголовок (строка 2 - акцентная)',
    type: 'text' as const,
    value: titleLine2.value,
    placeholder: 'Вторая строка заголовка (выделена цветом)',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'titleLine3',
    label: 'Заголовок (строка 3)',
    type: 'text' as const,
    value: titleLine3.value,
    placeholder: 'Третья строка заголовка',
    required: true,
    icon: 'fa-solid fa-heading',
  },
  {
    key: 'description',
    label: 'Описание',
    type: 'textarea' as const,
    value: description.value,
    placeholder: 'Описание секции',
    rows: 4,
    hint: 'Основной текст под заголовком',
    icon: 'fa-solid fa-align-left',
  },
  {
    key: 'buttonText1',
    label: 'Текст первой кнопки',
    type: 'text' as const,
    value: buttonText1.value,
    placeholder: 'Текст основной кнопки',
    icon: 'fa-solid fa-arrow-right',
  },
  {
    key: 'buttonText2',
    label: 'Текст второй кнопки',
    type: 'text' as const,
    value: buttonText2.value,
    placeholder: 'Текст вторичной кнопки',
    icon: 'fa-solid fa-arrow-right',
  },
  {
    key: 'cardBadge',
    label: 'Бейдж на карточке',
    type: 'text' as const,
    value: cardBadge.value,
    placeholder: 'Например: Звезда сезона',
    icon: 'fa-solid fa-star',
  },
  {
    key: 'animalName',
    label: 'Имя животного',
    type: 'text' as const,
    value: animalName.value,
    placeholder: 'Например: Симба',
    icon: 'fa-solid fa-paw',
  },
  {
    key: 'animalInfo',
    label: 'Информация о животном',
    type: 'text' as const,
    value: animalInfo.value,
    placeholder: 'Например: Африканский лев · Зона Саванна',
    hint: 'Описание под именем животного',
    icon: 'fa-solid fa-info-circle',
  },
  {
    key: 'statsAnimals',
    label: 'Статистика: животные',
    type: 'text' as const,
    value: statsAnimals.value,
    placeholder: 'Например: 3000+',
    icon: 'fa-solid fa-paw',
  },
  {
    key: 'statsContinents',
    label: 'Статистика: континенты',
    type: 'text' as const,
    value: statsContinents.value,
    placeholder: 'Например: 5',
    icon: 'fa-solid fa-globe',
  },
])

// State for Modal
const isModalOpen = ref(false)
const selectedAnimalId = ref<string | null>(null)

// State for Global Cursor Glow
const heroRef = ref<HTMLElement | null>(null)
const cursor = reactive({ x: 0, y: 0 })
const satellite1 = reactive({ x: 0, y: 0 })
const satellite2 = reactive({ x: 0, y: 0 })

const handleGlobalMouseMove = (e: MouseEvent) => {
  if (!heroRef.value) return

  const rect = heroRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  cursor.x = x
  cursor.y = y
  satellite1.x = x + 30
  satellite1.y = y + 50
  satellite2.x = x - 20
  satellite2.y = y + 70
}

// State for Card Parallax & Internal Glow
const cardRef = ref<HTMLElement | null>(null)
const cardMouse = reactive({ x: 0, y: 0 })
const rotate = reactive({ x: 0, y: 0 })

const handleCardMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()

  cardMouse.x = e.clientX - rect.left
  cardMouse.y = e.clientY - rect.top

  const centerX = rect.width / 2
  const centerY = rect.height / 2
  rotate.y = (e.clientX - rect.left - centerX) / 20
  rotate.x = -(e.clientY - rect.top - centerY) / 20
}

const handleCardMouseLeave = () => {
  rotate.x = 0
  rotate.y = 0
}

const cardStyle = computed(() => ({
  transform: `rotateY(${rotate.y}deg) rotateX(${rotate.x}deg)`,
}))

// Modal Logic
const openAnimalModal = (id: string) => {
  selectedAnimalId.value = id
  isModalOpen.value = true
}

const closeAnimalModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedAnimalId.value = null
  }, 300)
}

const openVirtualTour = () => {
  console.log('Открыть виртуальный тур')
}

// Edit Modal Logic
const openEditModal = () => {
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const handleEditSave = (values: Record<string, any>) => {
  // Update all reactive values
  if (values.badgeText !== undefined) badgeText.value = values.badgeText
  if (values.titleLine1 !== undefined) titleLine1.value = values.titleLine1
  if (values.titleLine2 !== undefined) titleLine2.value = values.titleLine2
  if (values.titleLine3 !== undefined) titleLine3.value = values.titleLine3
  if (values.description !== undefined) description.value = values.description
  if (values.buttonText1 !== undefined) buttonText1.value = values.buttonText1
  if (values.buttonText2 !== undefined) buttonText2.value = values.buttonText2
  if (values.cardBadge !== undefined) cardBadge.value = values.cardBadge
  if (values.animalName !== undefined) animalName.value = values.animalName
  if (values.animalInfo !== undefined) animalInfo.value = values.animalInfo
  if (values.statsAnimals !== undefined) statsAnimals.value = values.statsAnimals
  if (values.statsContinents !== undefined) statsContinents.value = values.statsContinents

  console.log('Сохранены изменения:', values)
  // TODO: Отправить данные на бэкенд
}

// ✅ Функция для переключения режима редактирования (вызывается из App.vue)
const toggleEditMode = () => {
  openEditModal()
}

// Expose для родительского компонента
defineExpose({
  openEditModal,
  toggleEditMode,
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.float {
  animation: float 6s ease-in-out infinite;
}
.float-delay {
  animation: float 6s ease-in-out infinite 3s;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}
</style>