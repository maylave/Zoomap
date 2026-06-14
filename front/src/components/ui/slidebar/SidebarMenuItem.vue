<template>
  <button
    @click="$emit('click', id)"
    class="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
    :class="[
      isActive
        ? 'bg-lime-400/15 text-lime shadow-[inset_0_0_0_1px_rgba(163,230,53,0.2)]'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    ]"
  >
    <!-- ✅ Используем BaseIcon вместо <component :is="icon"> -->
    <BaseIcon 
      :name="icon" 
      size="sm"
      class="shrink-0 transition-transform duration-200 group-hover:scale-110"
      :class="isActive ? 'text-lime' : 'text-white/50'"
    />
    
    <span class="truncate">{{ label }}</span>
    
    <!-- Бейдж -->
    <span 
      v-if="badge" 
      class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-lime-400/20 text-lime-300"
    >
      {{ badge }}
    </span>
  </button>
</template>

<script lang="ts" setup>
import type { IconName } from '@/icons'  // ✅ Импортируем IconName
import BaseIcon from '../BaseIcon.vue'   // ✅ Импортируем BaseIcon

defineProps<{
  id: string
  label: string
  icon: IconName  // ✅ IconName вместо Component
  isActive?: boolean
  badge?: string | number
}>()

defineEmits<{
  (e: 'click', id: string): void
}>()
</script>