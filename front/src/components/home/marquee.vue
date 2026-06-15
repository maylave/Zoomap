<template>
  <section class="relative w-full overflow-hidden bg-forest-300/80 backdrop-blur-sm py-4">
    
    <!-- Блок предупреждения (только для админа) -->
    <div
      v-if="isAdmin"
      class="group/warning mx-6 mb-4 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-3 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
          <i class="fa-solid fa-triangle-exclamation text-warning text-sm"></i>
        </div>
        <div>
          <p class="text-cream-100 text-xs font-medium">
            Управление бегущей строкой
          </p>
          <p class="text-cream-100/60 text-[10px] mt-0.5">
            Редактируйте зоны или добавьте новые
          </p>
        </div>
      </div>

      <button
        class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-1.5 rounded-lg hover:bg-white/5"
        title="Редактировать бегущую строку"
      >
        <i class="fa-solid fa-pen text-xs"></i>
      </button>
    </div>

    <!-- Градиентные маски по краям для плавного исчезновения текста -->
    <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-forest-300/80 to-transparent" />
    <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-forest-300/80 to-transparent" />

    <div class="marquee-wrap flex overflow-hidden">
      <div class="marquee-track flex whitespace-nowrap">
        <!-- Дублируем контент дважды для бесшовной анимации -->
        <template v-for="n in 2" :key="n">
          <span 
            v-for="(zone, index) in zones" 
            :key="`${n}-${index}`"
            class="group/zone relative flex items-center px-8 text-sm font-medium uppercase tracking-wider text-forest-900"
          >
            {{ zone }}
            <span class="ml-8 opacity-60">✦</span>
            
            <!-- Админские иконки (только для админа, появляются при hover) -->
            <template v-if="isAdmin">
              <span class="ml-3 flex items-center gap-2 opacity-0 group-hover/zone:opacity-100 transition-opacity duration-200">
                <button
                  class="text-cream-100/60 hover:text-accent transition-colors p-1 rounded hover:bg-white/10"
                  title="Редактировать зону"
                  @click.stop
                >
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button
                  class="text-cream-100/60 hover:text-error transition-colors p-1 rounded hover:bg-white/10"
                  title="Удалить зону"
                  @click.stop
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </span>
            </template>
          </span>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Флаг администратора — в будущем можно получать из store или props
const isAdmin = ref(true)

// Правильное определение пропсов в Vue 3 + TS
const props = withDefaults(defineProps<{
  zones?: string[]
}>(), {
  zones: () => [
    'Африканская саванна',
    'Тропический лес',
    'Арктическая зона',
    'Океанариум',
    'Детский зоопарк',
    'Ночное сафари'
  ]
})
</script>

<style scoped>
.marquee-track {
  animation: marquee 25s linear infinite;
}

/* Останавливаем анимацию при наведении для удобства чтения */
.marquee-wrap:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>