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
          ref="modalRef"
          class="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-forest-400 p-8 shadow-2xl"
          @click.stop
          role="dialog"
          aria-modal="true"
          :aria-labelledby="'modal-title-' + modalId"
        >
          <!-- Header -->
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h3
                :id="'modal-title-' + modalId"
                class="text-2xl font-bold text-cream-100"
              >
                {{ title }}
              </h3>
              <p v-if="subtitle" class="mt-1 text-sm text-cream-100/60">
                {{ subtitle }}
              </p>
            </div>

            <button
              @click="handleClose"
              :disabled="isSaving"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cream-100/60 transition-all hover:bg-white/10 hover:text-cream-100 disabled:opacity-50"
              aria-label="Закрыть"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Form Fields -->
          <div class="max-h-[60vh] space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="field in fields" :key="field.key">
              <label
                v-if="field.label && field.type !== 'checkbox'"
                :for="field.key"
                class="mb-2 block text-sm font-medium text-cream-100/80"
              >
                {{ field.label }}
                <span v-if="field.required" class="ml-1 text-lime">*</span>
              </label>

              <div class="relative">
                <!-- Text / Number / Email / URL / Password -->
                <input
                  v-if="['text', 'number', 'email', 'url', 'password'].includes(field.type || 'text')"
                  :id="field.key"
                  :type="field.type || 'text'"
                  :value="localValues[field.key]"
                  :placeholder="field.placeholder"
                  :required="field.required"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step"
                  class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-cream-100 placeholder:text-cream-100/30 outline-none transition-all duration-200 focus:border-lime/50 focus:bg-white/10 focus:ring-2 focus:ring-lime/20"
                  :class="{ 'border-terracotta/50': errors[field.key] }"
                  @input="handleInput(field.key, $event)"
                  @blur="handleBlur(field.key)"
                />

                <!-- Textarea с auto-resize -->
                <textarea
                  v-else-if="field.type === 'textarea'"
                  :id="field.key"
                  :value="localValues[field.key]"
                  :placeholder="field.placeholder"
                  :rows="field.rows || 3"
                  :required="field.required"
                  class="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-cream-100 placeholder:text-cream-100/30 outline-none transition-all duration-200 focus:border-lime/50 focus:bg-white/10 focus:ring-2 focus:ring-lime/20"
                  :class="{ 'border-terracotta/50': errors[field.key] }"
                  @input="handleInput(field.key, $event); autoResizeTextarea($event)"
                  @blur="handleBlur(field.key)"
                />

                <!-- Select -->
                <select
                  v-else-if="field.type === 'select'"
                  :id="field.key"
                  :value="localValues[field.key]"
                  :required="field.required"
                  class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-cream-100 outline-none transition-all duration-200 focus:border-lime/50 focus:bg-white/10 focus:ring-2 focus:ring-lime/20"
                  :class="{ 'border-terracotta/50': errors[field.key] }"
                  @change="handleInput(field.key, $event)"
                  @blur="handleBlur(field.key)"
                >
                  <option v-if="field.placeholder" value="" disabled>
                    {{ field.placeholder }}
                  </option>
                  <option
                    v-for="option in field.options"
                    :key="option.value"
                    :value="option.value"
                    class="bg-forest-400"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <!-- Checkbox -->
                <label
                  v-else-if="field.type === 'checkbox'"
                  :for="field.key"
                  class="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    :id="field.key"
                    type="checkbox"
                    :checked="localValues[field.key]"
                    class="w-5 h-5 rounded border-white/20 bg-white/5 text-lime focus:ring-lime/20"
                    @change="handleInput(field.key, $event)"
                  />
                  <span class="text-cream-100/80 group-hover:text-cream-100 transition-colors">
                    {{ field.checkboxLabel || field.label }}
                  </span>
                </label>

                <!-- Date -->
                <input
                  v-else-if="field.type === 'date'"
                  :id="field.key"
                  type="date"
                  :value="localValues[field.key]"
                  :required="field.required"
                  :min="field.minDate"
                  :max="field.maxDate"
                  class="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-cream-100 outline-none transition-all duration-200 focus:border-lime/50 focus:bg-white/10 focus:ring-2 focus:ring-lime/20"
                  :class="{ 'border-terracotta/50': errors[field.key] }"
                  @input="handleInput(field.key, $event)"
                  @blur="handleBlur(field.key)"
                />

                <!-- Color Picker -->
                <input
                  v-else-if="field.type === 'color'"
                  :id="field.key"
                  type="color"
                  :value="localValues[field.key]"
                  class="w-full h-14 rounded-2xl border border-white/10 bg-white/5 cursor-pointer"
                  @input="handleInput(field.key, $event)"
                />
              </div>

              <!-- Hint -->
              <p v-if="field.hint && !errors[field.key]" class="mt-1.5 text-xs text-cream-100/40">
                {{ field.hint }}
              </p>

              <!-- Error с анимацией -->
              <Transition name="error-fade">
                <p
                  v-if="errors[field.key]"
                  class="mt-1.5 text-xs text-terracotta flex items-center gap-1"
                >
                  <i class="fa-solid fa-circle-exclamation"></i>
                  {{ errors[field.key] }}
                </p>
              </Transition>
            </div>

            <!-- Общая ошибка -->
            <Transition name="error-fade">
              <div
                v-if="generalError"
                class="rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta flex items-center gap-2"
              >
                <i class="fa-solid fa-triangle-exclamation"></i>
                {{ generalError }}
              </div>
            </Transition>
          </div>

          <!-- Footer Actions -->
          <div class="mt-8 flex items-center justify-end gap-3">
            <button
              @click="handleClose"
              :disabled="isSaving"
              class="rounded-xl border border-white/10 px-6 py-3 font-medium text-cream-100/60 transition-all duration-200 hover:bg-white/5 hover:text-cream-100 disabled:opacity-50"
            >
              Отмена
            </button>

            <button
              @click="handleSave"
              :disabled="isSaving"
              class="rounded-xl bg-lime px-8 py-3 font-semibold text-forest-900 transition-all duration-200 hover:bg-lime/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="isSaving"
                class="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{{ isSaving ? 'Сохранение...' : 'Сохранить' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'

// ==================== TYPES ====================

interface SelectOption {
  value: string | number
  label: string
}

interface EditField {
  key: string
  label?: string
  type?: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'password' | 'select' | 'checkbox' | 'date' | 'color'
  value: string | number | boolean
  placeholder?: string
  required?: boolean
  hint?: string
  icon?: string
  rows?: number
  // Для number
  min?: number
  max?: number
  step?: number
  // Для date
  minDate?: string
  maxDate?: string
  // Для select
  options?: SelectOption[]
  // Для checkbox
  checkboxLabel?: string
  // Кастомная валидация
  validate?: (value: any) => string | null
}

interface Props {
  visible: boolean
  title: string
  subtitle?: string
  fields: EditField[]
}

interface Emits {
  (e: 'close'): void
  (e: 'save', values: Record<string, any>): void | Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== STATE ====================

const modalId = `modal-${Math.random().toString(36).substring(2, 9)}`
const modalRef = ref<HTMLElement | null>(null)
const isSaving = ref(false)
const errors = reactive<Record<string, string>>({})
const generalError = ref<string | null>(null)

// Локальные значения (копия props.fields, чтобы не мутировать)
const localValues = reactive<Record<string, any>>({})

// ==================== WATCHERS ====================

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      // Сброс ошибок
      Object.keys(errors).forEach(key => delete errors[key])
      generalError.value = null
      
      // Копируем значения из props
      props.fields.forEach(field => {
        localValues[field.key] = field.value
      })
      
      // Блокируем скролл
      document.body.style.overflow = 'hidden'
      
      // ✅ Auto-focus на первом поле
      await nextTick()
      const firstInput = modalRef.value?.querySelector(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
      ) as HTMLElement
      firstInput?.focus()
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

// ==================== KEYBOARD HANDLERS ====================

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return
  
  // ESC — закрыть модалку
  if (e.key === 'Escape') {
    if (!isSaving.value) {
      handleClose()
    }
    return
  }
  
  // Tab — focus trap
  if (e.key === 'Tab' && modalRef.value) {
    const focusableElements = modalRef.value.querySelectorAll(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

// ==================== VALIDATION ====================

const validateField = (field: EditField, value: any): string | null => {
  // Required
  if (field.required) {
    if (value === undefined || value === null || value === '') {
      return 'Обязательное поле'
    }
    if (typeof value === 'string' && !value.trim()) {
      return 'Обязательное поле'
    }
  }

  // Email
  if (field.type === 'email' && value && String(value).trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(value))) {
      return 'Неверный формат email'
    }
  }

  // URL
  if (field.type === 'url' && value && String(value).trim()) {
    try {
      new URL(String(value))
    } catch {
      return 'Неверный формат URL'
    }
  }

  // Number range
  if (field.type === 'number' && value !== '' && value !== undefined) {
    const num = Number(value)
    if (isNaN(num)) {
      return 'Должно быть числом'
    }
    if (field.min !== undefined && num < field.min) {
      return `Минимум: ${field.min}`
    }
    if (field.max !== undefined && num > field.max) {
      return `Максимум: ${field.max}`
    }
  }

  // Кастомная валидация
  if (field.validate) {
    return field.validate(value)
  }

  return null
}

const validateAll = (): boolean => {
  let isValid = true
  
  // Очищаем ошибки
  Object.keys(errors).forEach(key => delete errors[key])
  
  for (const field of props.fields) {
    const error = validateField(field, localValues[field.key])
    if (error) {
      errors[field.key] = error
      isValid = false
    }
  }
  
  return isValid
}

// ==================== HANDLERS ====================

const handleInput = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  
  if (!target) return
  
  // Определяем тип значения
  let value: any
  if (target instanceof HTMLInputElement && target.type === 'checkbox') {
    value = target.checked
  } else if (target instanceof HTMLInputElement && target.type === 'number') {
    value = target.value === '' ? '' : Number(target.value)
  } else {
    value = target.value
  }
  
  localValues[key] = value
  
  // Убираем ошибку при вводе
  if (errors[key]) {
    delete errors[key]
  }
}

// ✅ Live validation при blur
const handleBlur = (key: string) => {
  const field = props.fields.find(f => f.key === key)
  if (!field) return
  
  const error = validateField(field, localValues[key])
  if (error) {
    errors[key] = error
  } else {
    delete errors[key]
  }
}

// ✅ Auto-resize textarea
const autoResizeTextarea = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  if (!target) return
  
  target.style.height = 'auto'
  target.style.height = target.scrollHeight + 'px'
}

const handleClose = () => {
  if (isSaving.value) return
  emit('close')
}

const handleSave = async () => {
  // Валидация
  if (!validateAll()) {
    generalError.value = 'Пожалуйста, исправьте ошибки в форме'
    
    // ✅ Скроллим к первой ошибке
    await nextTick()
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element?.focus()
    }
    return
  }
  
  isSaving.value = true
  generalError.value = null
  
  try {
    // Вызываем save (может быть async)
    await emit('save', { ...localValues })
  } catch (error: any) {
    console.error('Save error:', error)
    generalError.value = error.message || 'Ошибка сохранения'
  } finally {
    isSaving.value = false
  }
}

// ==================== EXPOSE ====================

defineExpose({
  validateAll,
  localValues,
})
</script>

<style scoped>
/* Кастомный скроллбар */
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

/* Анимация модалки */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active > div:last-child,
.modal-fade-leave-active > div:last-child {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from > div:last-child,
.modal-fade-leave-to > div:last-child {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

/* ✅ Анимация ошибок */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Стилизация select option */
select option {
  background-color: #1e361c;
  color: #f5e6d3;
}

/* Стилизация checkbox */
input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

input[type="checkbox"]:checked {
  background-color: #a8c96b;
  border-color: #a8c96b;
}

input[type="checkbox"]:checked::after {
  content: '✓';
  color: #1a2e1a;
  font-size: 14px;
  font-weight: bold;
}

/* Стилизация date input */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

/* Стилизация color input */
input[type="color"] {
  -webkit-appearance: none;
  border: none;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 16px;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 16px;
}
</style>