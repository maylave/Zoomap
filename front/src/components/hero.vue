<template>
  <section 
    ref="heroRef"
    class="relative min-h-screen overflow-hidden bg-forest-200 text-cream-100 flex items-center group"
    @mousemove="handleGlobalMouseMove"
  >
    <!-- 1. Основной яркий курсор (Теперь absolute) -->
    <div 
      class="pointer-events-none absolute z-0 w-[300px] h-[300px] rounded-full bg-lime/40 blur-[60px] transition-transform duration-75 ease-out will-change-transform mix-blend-screen"
      :style="{ 
        left: '-150px', 
        top: '-150px',
        transform: `translate(${cursor.x}px, ${cursor.y}px)` 
      }"
    />

    <!-- 2. Спутник 1 -->
    <div 
      class="pointer-events-none absolute z-0 w-[120px] h-[120px] rounded-full bg-emerald-400/30 blur-[40px] transition-transform duration-150 ease-out will-change-transform mix-blend-screen"
      :style="{ 
        left: '-60px', 
        top: '-60px',
        transform: `translate(${satellite1.x}px, ${satellite1.y}px)` 
      }"
    />

    <!-- 3. Спутник 2 -->
    <div 
      class="pointer-events-none absolute z-0 w-[80px] h-[80px] rounded-full bg-lime-200/40 blur-[30px] transition-transform duration-200 ease-out will-change-transform mix-blend-screen"
      :style="{ 
        left: '-40px', 
        top: '-40px',
        transform: `translate(${satellite2.x}px, ${satellite2.y}px)` 
      }"
    />

    <!-- Фоновые статические пятна -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
    </div>

    <div class="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:px-8">
      <!-- Content -->
      <div class="flex flex-col items-start space-y-8">
        <div class="inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-lime backdrop-blur-md shadow-[0_0_15px_rgba(168,201,107,0.1)]">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-lime"></span>
          </span>
          Открыто каждый день
        </div>

        <h1 class="font-serif text-5xl font-black leading-[1.1] lg:text-7xl tracking-tight drop-shadow-lg">
          Мир дикой
          <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-lime to-emerald-400 italic">
            природы
          </span>
          <br />
          у твоих ног
        </h1>

        <p class="max-w-xl text-lg leading-relaxed text-cream-100/70">
          ZooVerse — живое путешествие по пяти континентам без перелётов.
          Более 3 000 животных, интерактивные зоны и незабываемые впечатления
          для всей семьи.
        </p>

        <div class="flex flex-wrap gap-4 pt-4">
          <button
            @click="openAnimalModal('lion')"
            class="group relative px-8 py-4 bg-lime text-forest-900 font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(168,201,107,0.6)]"
          >
            <span class="relative z-10 flex items-center gap-2">
              Познакомиться с животными
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </button>

          <button class="px-8 py-4 rounded-full border border-white/10 bg-white/5 text-cream-100 font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-3 group">
            <span class="flex size-10 items-center justify-center rounded-full bg-white/10 border border-white/20 group-hover:border-lime/50 group-hover:bg-lime/10 transition-colors">
              <svg class="w-4 h-4 ml-0.5 text-cream-100 group-hover:text-lime" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Виртуальный тур
          </button>
        </div>
      </div>

      <!-- Visual with Parallax & Internal Glow -->
      <div class="relative hidden items-center justify-center lg:flex perspective-1000">
        <div 
          ref="cardRef"
          class="relative h-[500px] w-[360px] transition-transform duration-100 ease-out preserve-3d cursor-pointer"
          :style="cardStyle"
          @mousemove.stop="handleCardMouseMove"
          @mouseleave="handleCardMouseLeave"
          @click="openAnimalModal('lion')" 
        >
          <!-- Main Card -->
          <div class="absolute inset-0 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-moss/40 to-forest-300/40 shadow-2xl backdrop-blur-xl">
            
            <!-- Внутренний свет карточки (Spotlight) -->
            <div 
              class="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none z-20 mix-blend-overlay"
              :style="{
                background: `radial-gradient(600px circle at ${cardMouse.x}px ${cardMouse.y}px, rgba(168, 201, 107, 0.25), transparent 40%)`
              }"
            ></div>

            <!-- SVG Lion Icon -->
            <div class="absolute inset-0 flex items-center justify-center select-none drop-shadow-2xl filter brightness-110 transition-transform duration-500 group-hover:scale-110 z-10">
              <AppIcon name="lion" class="w-64 h-64 text-lime/90" />
            </div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-forest-900 via-transparent to-transparent opacity-80 z-10" />

            <div class="absolute left-6 top-6 rounded-full border border-lime/30 bg-black/40 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-lime backdrop-blur-md flex items-center gap-1.5 z-20">
              <svg class="w-3 h-3 text-lime" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Звезда сезона
            </div>

            <div class="absolute bottom-8 left-8 right-8 z-20">
              <h3 class="font-serif text-4xl font-bold text-white mb-1">Симба</h3>
              <p class="text-sm text-cream-100/60 font-medium">Африканский лев · Зона Саванна</p>
            </div>
          </div>

          <!-- Floating Badges -->
          <div class="float absolute -right-12 top-10 flex items-center gap-3 rounded-2xl bg-white/90 px-5 py-4 text-forest-400 shadow-xl backdrop-blur-md border border-white/50 z-30">
            <div class="p-2 bg-forest-100 rounded-full">
               <AppIcon name="paw" class="w-6 h-6 text-forest-400" />
            </div>
            <div>
              <div class="font-serif text-2xl font-bold leading-none">3000+</div>
              <div class="text-[10px] uppercase font-bold text-gray-500 tracking-wider">животных</div>
            </div>
          </div>

          <div class="float-delay absolute -left-12 bottom-20 flex items-center gap-3 rounded-2xl bg-white/90 px-5 py-4 text-forest-400 shadow-xl backdrop-blur-md border border-white/50 z-30">
             <div class="p-2 bg-forest-100 rounded-full">
               <AppIcon name="globe" class="w-6 h-6 text-forest-400" />
            </div>
            <div>
              <div class="font-serif text-2xl font-bold leading-none">5</div>
              <div class="text-[10px] uppercase font-bold text-gray-500 tracking-wider">континентов</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Component -->
    <AnimalModal 
      :visible="isModalOpen" 
      :animal-id="selectedAnimalId"
      @close="closeAnimalModal"
    />
  </section>
</template>

<script setup lang="ts">
import AnimalModal from '@/components/overlay/AnimalModal.vue'
import AppIcon from '@/components/ui/BaseIcon.vue'
import { computed, reactive, ref } from 'vue'

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
  
  // Получаем координаты мыши ОТНОСИТЕЛЬНО секции (а не всего экрана)
  const rect = heroRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  // Основной курсор
  cursor.x = x
  cursor.y = y

  // Спутники (немного смещены вниз и в стороны)
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
  transform: `rotateY(${rotate.y}deg) rotateX(${rotate.x}deg)`
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
</script>

<style scoped>
.perspective-1000 { perspective: 1000px; }
.preserve-3d { transform-style: preserve-3d; }
.float { animation: float 6s ease-in-out infinite; }
.float-delay { animation: float 6s ease-in-out infinite 3s; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
</style>