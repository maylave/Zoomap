<template>
  <aside class="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 overflow-y-auto custom-scrollbar">
    <nav class="p-3 space-y-1">
      <!-- Поиск -->
      <SidebarSearch
        v-if="showSearch"
        v-model="searchQuery"
        :placeholder="searchPlaceholder"
      />

      <!-- Группы меню -->
      <SidebarMenuGroup
        v-for="group in filteredMenuGroups"
        :key="group.title"
        :title="group.title"
        :items="group.items"
        :model-value="modelValue"
        @update:model-value="handleSelect"
        @select="handleSelect"
      />
    </nav>
  </aside>
</template>

<script lang="ts" setup>
import { ref, computed, type Component } from 'vue'
import SidebarSearch from './slidebar/slidebarSearch.vue'
import SidebarMenuGroup from './slidebar/SidebarMenuGroup.vue'

// Типы
interface MenuItem {
  id: string
  label: string
  icon: Component
  badge?: string | number
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

// Props
const props = withDefaults(defineProps<{
  menuGroups: MenuGroup[]
  modelValue?: string
  showSearch?: boolean
  searchPlaceholder?: string
}>(), {
  modelValue: '',
  showSearch: true,
  searchPlaceholder: 'Поиск...'
})

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', itemId: string): void
}>()

// Локальное состояние
const searchQuery = ref('')

// Фильтрация меню по поиску
const filteredMenuGroups = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.menuGroups
  }

  const query = searchQuery.value.toLowerCase()
  
  return props.menuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.label.toLowerCase().includes(query)
      )
    }))
    .filter(group => group.items.length > 0)
})

// Выбор пункта меню
const handleSelect = (itemId: string) => {
  emit('update:modelValue', itemId)
  emit('select', itemId)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>