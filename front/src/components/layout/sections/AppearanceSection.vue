<script setup lang="ts">
const props = defineProps<{
  appearance: {
    theme: string
    language: string
  }
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- Тема оформления -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 class="mb-4 text-lg font-semibold text-white">Тема оформления</h3>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="theme in ['Тёмная', 'Светлая', 'Системная']"
          :key="theme"
          class="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-white transition hover:border-accent/50 hover:bg-white/10"
          :class="{ 'border-accent bg-accent/10': appearance.theme === theme }"
          @click="appearance.theme = theme"
        >
          {{ theme }}
        </button>
      </div>
    </div>

    <!-- Язык интерфейса -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 class="mb-4 text-lg font-semibold text-white">Язык интерфейса</h3>
      <select
        v-model="appearance.language"
        class="select select-bordered w-full border-white/10 bg-white/5 text-white"
      >
        <option value="ru">Русский</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  </div>
</template>