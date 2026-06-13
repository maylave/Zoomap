<template>
  <!-- Рендерим только если иконка найдена -->
  <template v-if="svg">
    <!-- ВАРИАНТ 1: Если это полный SVG (как животные) -->
    <span 
      v-if="isFullSvg" 
      class="inline-flex icon-wrapper" 
      :class="[sizeClass, colorClass]" 
      v-html="normalizedSvg" 
    />

    <!-- ВАРИАНТ 2: Если это только внутренности (как стрелки) -->
    <svg
      v-else
      class="inline-flex"
      :class="[sizeClass, colorClass]"
      viewBox="0 0 54 54" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      v-html="normalizedSvg"
    />
  </template>
  
  <!-- Опционально: можно показать заглушку, если иконка не найдена -->
  <span v-else class="text-red-500 text-xs">[Icon not found]</span>
</template>

<script setup lang="ts">
import { allIcons, type IconName } from '@/icons'
import { computed } from 'vue'

interface Props {
  name: IconName
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'text-current'
})

// ✅ БЕЗОПАСНОЕ ПОЛУЧЕНИЕ ИКОНКИ
// Если иконки нет в объекте, вернется undefined, но мы сразу заменим его на пустую строку
const svg = computed(() => {
  const icon = allIcons[props.name]
  
  // Если иконка не найдена, пишем предупреждение в консоль (помогает при отладке)
  if (!icon) {
    console.warn(`[BaseIcon] Иконка "${props.name}" не найдена в allIcons!`)
    return ''
  }
  
  return icon
})

// Проверяем формат: начинается ли строка с тега <svg ?
// Теперь svg.value всегда строка, поэтому .trim() не упадет
const isFullSvg = computed(() => svg.value.trim().startsWith('<svg'))

// Умная нормализация: заменяем stroke="black" на currentColor
const normalizedSvg = computed(() => 
  svg.value.replace(/stroke=["']black["']/g, 'stroke="currentColor"')
)

const sizeClass = computed(() => ({
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}[props.size]))

const colorClass = computed(() => props.color)
</script>

<style scoped>
.icon-wrapper :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>