<template>
  <Transition name="fade">
    <div
      v-if="visible && eventData"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click="$emit('close')"
    >
      <!-- Modal Content -->
      <div
        class="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-forest-900 shadow-2xl ring-1 ring-white/10"
        @click.stop
      >
        <!-- Close Button -->
        <button
          class="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-cream-100 hover:bg-black/40 transition-colors"
          @click="$emit('close')"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header Image/Color Block -->
        <div class="h-32 w-full" :class="eventData.dateBg">
          <div class="flex h-full items-center justify-center">
             <AppIcon :name="eventData.icon" class="size-16 text-white/80" />
          </div>
        </div>

        <!-- Body -->
        <div class="p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-cream-100">
              {{ eventData.day }} {{ eventData.month }}
            </span>
            <span class="text-sm font-medium" :class="eventData.categoryColor">
              {{ eventData.category }}
            </span>
          </div>

          <h2 class="text-3xl font-bold text-cream-100 mb-4">
            {{ eventData.title }}
          </h2>

          <p class="text-cream-100/70 leading-relaxed mb-8">
            {{ eventData.description }}
          </p>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between border-t border-white/10 pt-6">
            <div>
              <div class="text-2xl font-bold text-accent">{{ eventData.price }}</div>
              <div class="text-xs text-cream-100/40">{{ eventData.priceLabel }}</div>
            </div>

            <button class="btn btn-accent px-8 py-3 rounded-full font-semibold">
              {{ eventData.button }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/BaseIcon.vue'

interface EventItem {
  day: string
  month: string
  icon: string
  category: string
  title: string
  description: string
  price: string
  priceLabel: string
  button: string
  dateBg: string
  categoryColor: string
}

defineProps<{
  visible: boolean
  eventData: EventItem | null
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Анимация появления самого контента модалки */
.fade-enter-active .relative,
.fade-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fade-enter-from .relative,
.fade-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>