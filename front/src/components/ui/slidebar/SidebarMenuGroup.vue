<template>
  <div class="mb-2">
    <!-- Заголовок группы -->
    <div class="px-2 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">
      {{ title }}
    </div>

    <!-- Пункты меню -->
    <div class="space-y-1">
      <SidebarMenuItem
        v-for="item in items"
        :key="item.id"
        :id="item.id"
        :label="item.label"
        :icon="item.icon"
        :badge="item.badge"
        :is-active="modelValue === item.id"
        @click="handleItemClick"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IconName } from '@/icons'  // ✅ Импортируем IconName
import SidebarMenuItem from './SidebarMenuItem.vue'

interface MenuItem {
  id: string
  label: string
  icon: IconName  // ✅ IconName вместо Component
  badge?: string | number
}

defineProps<{
  title: string
  items: MenuItem[]
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', itemId: string): void
}>()

const handleItemClick = (itemId: string) => {
  emit('update:modelValue', itemId)
  emit('select', itemId)
}
</script>