<template>
  <div class="relative">
    <!-- Контент (слот) -->
    <slot></slot>

    <!-- FAB-кнопка: справа, чуть выше центра -->
    <div
      v-if="isAdmin"
      class="group absolute right-4 top-1/2 z-20 -translate-y-[60%]"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- Контейнер с кнопками и общим фоном -->
      <div 
        class="absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col-reverse items-center overflow-hidden rounded-full bg-black/20 
        border border-forest-100/10
        shadow-xl backdrop-blur-md transition-all duration-500 ease-out"
        :class="isHovered ? 'mb-2 opacity-100 border-forest-100/40' : 'mb-0 opacity-0'"
        :style="{ 
          maxHeight: isHovered ? `${(actions.length * 2.5) + 3}rem` : '0rem',
          transitionDelay: isHovered ? '0ms' : '200ms'
        }"
      >
        <!-- Дополнительные кнопки -->
        <div class="flex flex-col-reverse items-center gap-1.5 p-2">
          <button
            v-for="(action, index) in actions"
            :key="action.label"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
            :class="action.variant === 'danger' 
              ? 'bg-black/20 hover:bg-terracotta/80 hover:border-terracotta' 
              : 'bg-lime/10 hover:bg-lime/20 hover:border-lime/40 hover:text-lime'"
            :title="action.label"
            :style="{ 
              transitionDelay: `${100 + index * 50}ms`,
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.5)'
            }"
            @click.stop="action.onClick"
          >
            <!-- Font Awesome иконка -->
            <i v-if="action.icon?.includes('fa-')" :class="action.icon" class="text-sm"></i>
            <!-- Эмодзи -->
            <span v-else-if="action.emoji" class="text-base">{{ action.emoji }}</span>
            <!-- SVG иконка -->
            <span v-else-if="action.icon" v-html="action.icon" class="flex h-4 w-4 [&>svg]:h-full [&>svg]:w-full"></span>
          </button>
        </div>
      </div>

      <!-- Главная кнопка -->
      <button
        class="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-forest-300/80 hover:border-lime/40 hover:shadow-[0_0_20px_rgba(168,201,107,0.3)]"
        :title="editLabel"
        @click.stop="handleEdit"
      >
        <!-- Font Awesome иконка карандаша -->
        <i class="fa-solid fa-pen-to-square text-sm transition-transform duration-300 group-hover:rotate-12"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Action {
  label: string
  emoji?: string
  icon?: string  // Font Awesome класс (например: 'fa-solid fa-plus') или SVG HTML
  variant?: 'default' | 'danger'
  onClick: () => void
}

interface Props {
  isAdmin?: boolean
  editLabel?: string
  actions?: Action[]
}

const props = withDefaults(defineProps<Props>(), {
  isAdmin: true,
  editLabel: 'Редактировать',
  actions: () => [],
})

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const isHovered = ref(false)

const handleEdit = () => {
  emit('edit')
}
</script>