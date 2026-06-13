<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      @click="$emit('close')"
    >
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-forest-900 shadow-2xl ring-1 ring-white/10"
        @click.stop
      >
        <!-- Close Button -->
        <button
          class="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-cream-100 hover:bg-lime hover:text-forest-900 transition-colors"
          @click="$emit('close')"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header Image Area -->
        <div class="h-48 w-full bg-gradient-to-r from-moss to-forest-800 flex items-center justify-center relative overflow-hidden">
           <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <AppIcon :name="animalData?.icon || 'lion'" class="w-32 h-32 text-lime/80 drop-shadow-lg" />
        </div>

        <!-- Content -->
        <div class="p-8">
          <div class="flex items-center gap-3 mb-2">
            <span class="px-3 py-1 rounded-full bg-lime/10 text-lime text-xs font-bold uppercase tracking-wider">
              {{ animalData?.category }}
            </span>
            <span class="text-cream-100/40 text-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {{ animalData?.location }}
            </span>
          </div>

          <h2 class="text-4xl font-serif font-bold text-cream-100 mb-4">
            {{ animalData?.name }}
          </h2>

          <p class="text-cream-100/70 leading-relaxed mb-8">
            {{ animalData?.description }}
          </p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-4 mb-8">
            <div class="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
              <div class="text-lime font-bold text-xl">{{ animalData?.weight }}</div>
              <div class="text-xs text-cream-100/40 uppercase mt-1">Вес</div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
              <div class="text-lime font-bold text-xl">{{ animalData?.lifespan }}</div>
              <div class="text-xs text-cream-100/40 uppercase mt-1">Жизнь</div>
            </div>
            <div class="bg-white/5 p-4 rounded-2xl text-center border border-white/5">
              <div class="text-lime font-bold text-xl">{{ animalData?.diet }}</div>
              <div class="text-xs text-cream-100/40 uppercase mt-1">Диета</div>
            </div>
          </div>

          <button class="w-full py-4 rounded-xl bg-lime text-forest-900 font-bold hover:bg-lime/90 transition-colors shadow-lg shadow-lime/20">
            Узнать больше о виде
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/BaseIcon.vue'
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  animalId: string | null
}>()

defineEmits<{
  close: []
}>()

// Mock Data (в реальном проекте это придет из API или Pinia)
const animalsDB: Record<string, any> = {
  lion: {
    name: 'Симба',
    category: 'Хищник',
    location: 'Зона Саванна',
    description: 'Царь зверей и главный герой нашей саванны. Симба любит спать на солнце после плотного обеда и иногда радует гостей своим громким рыком.',
    weight: '190 кг',
    lifespan: '15 лет',
    diet: 'Мясо',
    icon: 'lion'
  },
  elephant: {
    name: 'Джамбо',
    category: 'Травоядное',
    location: 'Азиатский лес',
    description: 'Самый большой житель нашего зоопарка. Джамбо очень умный и любит рисовать картины хоботом.',
    weight: '5000 кг',
    lifespan: '60 лет',
    diet: 'Растения',
    icon: 'elephant'
  }
}

const animalData = computed(() => {
  if (!props.animalId) return null
  return animalsDB[props.animalId] || animalsDB['lion']
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active .relative, .fade-leave-active .relative { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
.fade-enter-from .relative, .fade-leave-to .relative { transform: scale(0.95) translateY(10px); opacity: 0; }
</style>