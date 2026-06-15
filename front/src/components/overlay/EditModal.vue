<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleClose"
      >
        <!-- Затемнённый фон -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <!-- Modal Content -->
        <div
          class="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-forest-400 p-8 shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-cream-100">
                {{ title }}
              </h3>
              <p v-if="subtitle" class="mt-1 text-sm text-cream-100/60">
                {{ subtitle }}
              </p>
            </div>

            <button
              @click="handleClose"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cream-100/60 transition-all hover:bg-white/10 hover:text-cream-100"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Form Fields -->
          <div class="max-h-[60vh] space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="field in fields"
              :key="field.key"
            >
              <label
                v-if="field.label"
                :for="field.key"
                class="mb-2 block text-sm font-medium text-cream-100/80"
                :class="{ 'text-lime': field.required }"
              >
                {{ field.label }}
                <span v-if="field.required" class="ml-1 text-lime">*</span>
              </label>

              <div class="relative">
                <input
                  v-if="field.type !== 'textarea'"
                  :id="field.key"
                  :type="field.type || 'text'"
                  :value="field.value"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-cream-100 placeholder:text-cream-100/30 outline-none transition-all duration-200 focus:border-lime/50 focus:bg-white/10 focus:ring-2 focus:ring-lime/20"
                  @input="handleInput(field.key, $event)"
                />

                <textarea
                  v-else
                  :id="field.key"
                  :value="field.value"
                  :placeholder="field.placeholder"
                  :rows="field.rows || 3"
                  :required="field.required"
                  class="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-cream-100 placeholder:text-cream-100/30 outline-none transition-all duration-200 focus:border-lime/50 focus:bg-white/10 focus:ring-2 focus:ring-lime/20"
                  @input="handleInput(field.key, $event)"
                />
              </div>

              <p v-if="field.hint" class="mt-1.5 text-xs text-cream-100/40">
                {{ field.hint }}
              </p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-8 flex items-center justify-end gap-3">
            <button
              @click="handleClose"
              class="rounded-xl border border-white/10 px-6 py-3 font-medium text-cream-100/60 transition-all duration-200 hover:bg-white/5 hover:text-cream-100"
            >
              Отмена
            </button>

            <button
              @click="handleSave"
              class="rounded-xl bg-lime px-8 py-3 font-semibold text-forest-900 transition-all duration-200 hover:bg-lime/90 hover:shadow-lg"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface EditField {
  key: string
  label?: string
  type?: 'text' | 'textarea' | 'number' | 'email' | 'url'
  value: string | number
  placeholder?: string
  required?: boolean
  hint?: string
  icon?: string
  rows?: number
}

interface Props {
  visible: boolean
  title: string
  subtitle?: string
  fields: EditField[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', values: Record<string, any>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Блокировка скролла
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

const handleClose = () => {
  emit('close')
}

const handleInput = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  if (target) {
    const field = props.fields.find(f => f.key === key)
    if (field) {
      field.value = target.value
    }
  }
}

const handleSave = () => {
  const requiredFields = props.fields.filter(f => f.required)
  for (const field of requiredFields) {
    if (!field.value || (typeof field.value === 'string' && !field.value.trim())) {
      console.warn(`Required field "${field.label}" is empty`)
      return
    }
  }

  const values = props.fields.reduce((acc, field) => {
    acc[field.key] = field.value
    return acc
  }, {} as Record<string, any>)

  emit('save', values)
  emit('close')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(168, 201, 107, 0.3);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 201, 107, 0.5);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from > div:last-child,
.modal-fade-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
}

.modal-fade-enter-active > div:last-child,
.modal-fade-leave-active > div:last-child {
  transition: all 0.3s ease;
}
</style>