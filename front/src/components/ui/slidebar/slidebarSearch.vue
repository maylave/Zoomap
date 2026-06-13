<template>
  <div class="relative mb-3">
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input 
      v-model="localQuery"
      type="text" 
      :placeholder="placeholder"
      class="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-lime-400/50 transition-colors"
    >
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: 'Поиск...'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localQuery = ref(props.modelValue)

// Синхронизация с родителем
watch(localQuery, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  localQuery.value = newValue
})
</script>