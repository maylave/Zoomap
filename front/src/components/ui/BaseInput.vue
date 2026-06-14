<script setup lang="ts">
import { computed, useAttrs } from 'vue'

// Определяем пропсы
interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  icon?: string
  required?: boolean
  name?: string
  id?: string
  maxlength?: number
  minlength?: number
  pattern?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

// Генерируем уникальный ID для связи label и input
const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

// Обработка ввода
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}

// Классы для состояния readonly
const inputClasses = computed(() => [
  'input input-bordered w-full transition-all duration-300',
  // Базовые цвета из темы
  'bg-white/5 border-white/10 text-cream-100 placeholder:text-cream-100/40',
  'focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20',
  // Readonly состояние
  props.readonly && [
    'bg-white/[0.02] border-white/5 cursor-default',
    'focus:border-white/10 focus:ring-0',
  ],
  // Disabled состояние
  props.disabled && 'opacity-50 cursor-not-allowed bg-white/[0.02]',
  // Error состояние
  props.error && 'input-error border-error/50 focus:border-error focus:ring-error/20',
])
</script>

<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label py-2">
      <span class="label-text text-cream-100/80 font-medium">
        {{ label }}
        <span v-if="required" class="text-accent ml-1">*</span>
      </span>
      <span v-if="hint && !readonly" class="label-text-alt text-cream-100/40">
        {{ hint }}
      </span>
    </label>

    <!-- Input wrapper -->
    <div class="relative">
      <!-- Icon (если есть) -->
      <span v-if="icon" class="text-cream-100/40 absolute top-1/2 left-3 -translate-y-1/2">
        <slot name="icon">
          <!-- Здесь можно использовать ваш AppIcon -->
          <AppIcon :name="icon" class="size-5" />
        </slot>
      </span>

      <!-- Input -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        :maxlength="maxlength"
        :minlength="minlength"
        :pattern="pattern"
        :autocomplete="autocomplete"
        :class="[inputClasses, icon && 'pl-10']"
        v-bind="$attrs"
        @input="onInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- Иконка "только чтение" -->
      <span
        v-if="readonly"
        class="text-cream-100/30 absolute top-1/2 right-3 -translate-y-1/2"
        title="Только для чтения"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </div>

    <!-- Error message -->
    <label v-if="error" class="label py-1">
      <span class="label-text-alt text-error">{{ error }}</span>
    </label>
  </div>
</template>
