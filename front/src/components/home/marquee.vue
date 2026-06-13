<template>
  <section  class="relative w-full overflow-hidden bg-forest-300/80 backdrop-blur-sm py-4">
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
            class="flex items-center px-8 text-sm font-medium uppercase tracking-wider text-forest-900"
          >
            {{ zone }}
            <span class="ml-8 opacity-60">✦</span>
          </span>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
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