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
          :class="{ 'max-w-3xl': hasIconPicker }"
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
                v-if="field.label && field.type !== 'checkbox' && field.type !== 'icon-picker'"
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

                <!-- ==================== ICON PICKER ==================== -->
                <div
                  v-else-if="field.type === 'icon-picker'"
                  class="rounded-2xl border border-white/10 bg-white/5 p-4"
                  :class="{ 'border-terracotta/50': errors[field.key] }"
                >
                  <!-- Label для icon-picker -->
                  <div class="mb-3 flex items-center justify-between">
                    <label class="text-sm font-medium text-cream-100/80">
                      {{ field.label }}
                      <span v-if="field.required" class="ml-1 text-lime">*</span>
                    </label>
                    <button
                      v-if="localValues[field.key]"
                      @click="handleInput(field.key, { target: { value: '' } })"
                      class="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-terracotta hover:bg-terracotta/10 transition"
                    >
                      <i class="fa-solid fa-xmark text-xs"></i>
                      Сбросить
                    </button>
                  </div>

                  <!-- Предпросмотр выбранной иконки -->
                  <div v-if="localValues[field.key]" class="mb-3 flex items-center gap-3 rounded-xl border border-lime/30 bg-lime/5 p-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-lime/20 text-lime">
                      <i :class="localValues[field.key]" class="text-2xl"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-cream-100 truncate">{{ localValues[field.key] }}</p>
                      <p class="text-xs text-cream-100/60">Выбранная иконка</p>
                    </div>
                  </div>

                  <!-- Поиск иконок -->
                  <div class="relative mb-3">
                    <input
                      v-model="iconSearch[field.key]"
                      type="text"
                      placeholder="Поиск иконок..."
                      class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-cream-100 placeholder:text-cream-100/30 outline-none transition-all duration-200 focus:border-lime/50 focus:bg-white/10"
                    />
                    <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40"></i>
                    <span v-if="iconSearch[field.key]" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cream-100/40">
                      {{ getFilteredIcons(field.key).length }} найдено
                    </span>
                  </div>

                  <!-- Категории (быстрые фильтры) -->
                  <div class="mb-3 flex flex-wrap gap-1.5">
                    <button
                      v-for="cat in iconCategories"
                      :key="cat.name"
                      @click="iconSearch[field.key] = cat.search"
                      class="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-cream-100/60 transition hover:border-lime/40 hover:bg-lime/10 hover:text-lime"
                    >
                      <i :class="cat.icon" class="mr-1"></i>
                      {{ cat.name }}
                    </button>
                  </div>

                  <!-- Сетка иконок -->
                  <div class="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-forest-400/50 p-3 icon-picker-scroll">
                    <div class="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                      <button
                        v-for="icon in getFilteredIcons(field.key)"
                        :key="icon"
                        @click="handleInput(field.key, { target: { value: icon } })"
                        class="flex aspect-square items-center justify-center rounded-lg border border-white/5 bg-white/5 text-cream-100/50 transition-all hover:border-lime/40 hover:bg-lime/10 hover:text-lime hover:scale-110 active:scale-95"
                        :class="{
                          'border-lime/50 bg-lime/20 text-lime shadow-[0_0_12px_rgba(168,201,107,0.3)]': localValues[field.key] === icon
                        }"
                        :title="icon"
                      >
                        <i :class="icon" class="text-base"></i>
                      </button>
                    </div>

                    <div v-if="getFilteredIcons(field.key).length === 0" class="py-8 text-center">
                      <i class="fa-solid fa-face-frown text-3xl text-cream-100/20 mb-2"></i>
                      <p class="text-sm text-cream-100/40">Иконки не найдены</p>
                    </div>
                  </div>

                  <!-- Подсказка -->
                  <p v-if="field.hint" class="mt-2 text-xs text-cream-100/40">
                    {{ field.hint }}
                  </p>
                </div>
              </div>

              <!-- Hint (для обычных полей) -->
              <p v-if="field.hint && field.type !== 'icon-picker' && !errors[field.key]" class="mt-1.5 text-xs text-cream-100/40">
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
import { ref, reactive, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'

// ==================== TYPES ====================

interface SelectOption {
  value: string | number
  label: string
}

interface EditField {
  key: string
  label?: string
  type?: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'password' | 'select' | 'checkbox' | 'date' | 'color' | 'icon-picker'
  value: string | number | boolean
  placeholder?: string
  required?: boolean
  hint?: string
  icon?: string
  rows?: number
  min?: number
  max?: number
  step?: number
  minDate?: string
  maxDate?: string
  options?: SelectOption[]
  checkboxLabel?: string
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
const localValues = reactive<Record<string, any>>({})

// Icon Picker state
const iconSearch = reactive<Record<string, string>>({})

// ==================== ICONS DATABASE ====================

const iconCategories = [
  { name: 'Все', search: '', icon: 'fa-solid fa-grip' },
  { name: 'Животные', search: 'paw', icon: 'fa-solid fa-paw' },
  { name: 'Природа', search: 'leaf', icon: 'fa-solid fa-leaf' },
  { name: 'Погода', search: 'sun', icon: 'fa-solid fa-sun' },
  { name: 'Время', search: 'clock', icon: 'fa-solid fa-clock' },
  { name: 'Еда', search: 'apple', icon: 'fa-solid fa-apple-whole' },
  { name: 'Действия', search: 'person', icon: 'fa-solid fa-person' },
  { name: 'Навигация', search: 'map', icon: 'fa-solid fa-map' },
  { name: 'Инфо', search: 'circle', icon: 'fa-solid fa-circle-info' },
  { name: 'Зоопарк', search: 'building', icon: 'fa-solid fa-building' },
  { name: 'Развлечения', search: 'camera', icon: 'fa-solid fa-camera' },
  { name: 'Покупки', search: 'cart', icon: 'fa-solid fa-cart-shopping' },
  { name: 'Транспорт', search: 'car', icon: 'fa-solid fa-car' },
  { name: 'Безопасность', search: 'shield', icon: 'fa-solid fa-shield' },
]

const allIcons = [
  // Животные
  'fa-solid fa-paw', 'fa-solid fa-dog', 'fa-solid fa-cat', 'fa-solid fa-crow',
  'fa-solid fa-spider', 'fa-solid fa-fish', 'fa-solid fa-fish-fins', 'fa-solid fa-horse',
  'fa-solid fa-cow', 'fa-solid fa-sheep', 'fa-solid fa-piggy-bank', 'fa-solid fa-dove',
  'fa-solid fa-otter', 'fa-solid fa-frog', 'fa-solid fa-bug', 'fa-solid fa-dragon',
  'fa-solid fa-kiwi-bird', 'fa-solid fa-hippo', 'fa-solid fa-elephant', 'fa-solid fa-monkey',
  
  // Природа
  'fa-solid fa-leaf', 'fa-solid fa-tree', 'fa-solid fa-seedling', 'fa-solid fa-mountain',
  'fa-solid fa-mountain-sun', 'fa-solid fa-water', 'fa-solid fa-fire', 'fa-solid fa-wind',
  'fa-solid fa-earth-americas', 'fa-solid fa-earth-europe', 'fa-solid fa-earth-africa',
  'fa-solid fa-earth-asia', 'fa-solid fa-volcano', 'fa-solid fa-meteor',
  
  // Погода
  'fa-solid fa-sun', 'fa-solid fa-moon', 'fa-solid fa-cloud', 'fa-solid fa-cloud-sun',
  'fa-solid fa-cloud-rain', 'fa-solid fa-cloud-showers-heavy', 'fa-solid fa-snowflake',
  'fa-solid fa-smog', 'fa-solid fa-temperature-high', 'fa-solid fa-temperature-low',
  'fa-solid fa-temperature-half', 'fa-solid fa-umbrella', 'fa-solid fa-rainbow',
  'fa-solid fa-cloud-bolt', 'fa-solid fa-cloud-meatball',
  
  // Время
  'fa-solid fa-clock', 'fa-solid fa-calendar', 'fa-solid fa-calendar-days',
  'fa-solid fa-calendar-week', 'fa-solid fa-hourglass-start', 'fa-solid fa-hourglass-half',
  'fa-solid fa-hourglass-end', 'fa-solid fa-stopwatch', 'fa-solid fa-timer',
  'fa-solid fa-alarm-clock', 'fa-solid fa-bell', 'fa-solid fa-bell-slash',
  
  // Еда
  'fa-solid fa-apple-whole', 'fa-solid fa-carrot', 'fa-solid fa-bread-slice',
  'fa-solid fa-cheese', 'fa-solid fa-drumstick-bite', 'fa-solid fa-egg',
  'fa-solid fa-pepper-hot', 'fa-solid fa-lemon', 'fa-solid fa-cookie',
  'fa-solid fa-cake-candles', 'fa-solid fa-ice-cream', 'fa-solid fa-mug-hot',
  'fa-solid fa-martini-glass', 'fa-solid fa-wine-glass',
  
  // Действия
  'fa-solid fa-person', 'fa-solid fa-person-walking', 'fa-solid fa-person-running',
  'fa-solid fa-person-swimming', 'fa-solid fa-person-biking', 'fa-solid fa-person-hiking',
  'fa-solid fa-person-skiing', 'fa-solid fa-person-snowboarding', 'fa-solid fa-people-group',
  'fa-solid fa-child', 'fa-solid fa-child-reaching', 'fa-solid fa-baby',
  'fa-solid fa-user', 'fa-solid fa-users', 'fa-solid fa-user-group',
  
  // Навигация
  'fa-solid fa-location-dot', 'fa-solid fa-map', 'fa-solid fa-map-pin',
  'fa-solid fa-map-location-dot', 'fa-solid fa-route', 'fa-solid fa-signs-post',
  'fa-solid fa-compass', 'fa-solid fa-globe', 'fa-solid fa-crosshairs',
  'fa-solid fa-location-crosshairs', 'fa-solid fa-street-view',
  
  // Информация
  'fa-solid fa-circle-info', 'fa-solid fa-circle-question', 'fa-solid fa-circle-exclamation',
  'fa-solid fa-circle-check', 'fa-solid fa-circle-xmark', 'fa-solid fa-star',
  'fa-solid fa-star-half-stroke', 'fa-solid fa-heart', 'fa-solid fa-bookmark',
  'fa-solid fa-tag', 'fa-solid fa-tags', 'fa-solid fa-ticket', 'fa-solid fa-award',
  'fa-solid fa-trophy', 'fa-solid fa-medal', 'fa-solid fa-crown',
  
  // Зоопарк / Здания
  'fa-solid fa-house', 'fa-solid fa-house-chimney', 'fa-solid fa-building',
  'fa-solid fa-building-columns', 'fa-solid fa-hotel', 'fa-solid fa-store',
  'fa-solid fa-warehouse', 'fa-solid fa-industry', 'fa-solid fa-school',
  'fa-solid fa-hospital', 'fa-solid fa-church', 'fa-solid fa-mosque',
  'fa-solid fa-place-of-worship', 'fa-solid fa-monument', 'fa-solid fa-campground',
  
  // Развлечения
  'fa-solid fa-camera', 'fa-solid fa-camera-retro', 'fa-solid fa-video',
  'fa-solid fa-music', 'fa-solid fa-film', 'fa-solid fa-gamepad', 'fa-solid fa-puzzle-piece',
  'fa-solid fa-gift', 'fa-solid fa-balloons', 'fa-solid fa-wand-magic-sparkles',
  'fa-solid fa-palette', 'fa-solid fa-masks-theater', 'fa-solid fa-photo-film',
  
  // Покупки
  'fa-solid fa-cart-shopping', 'fa-solid fa-basket-shopping', 'fa-solid fa-bag-shopping',
  'fa-solid fa-credit-card', 'fa-solid fa-money-bill', 'fa-solid fa-money-bill-wave',
  'fa-solid fa-money-check-dollar', 'fa-solid fa-receipt', 'fa-solid fa-percent',
  'fa-solid fa-sack-dollar', 'fa-solid fa-wallet', 'fa-solid fa-coins',
  
  // Транспорт
  'fa-solid fa-car', 'fa-solid fa-car-side', 'fa-solid fa-bus', 'fa-solid fa-bus-simple',
  'fa-solid fa-train', 'fa-solid fa-train-subway', 'fa-solid fa-plane',
  'fa-solid fa-plane-departure', 'fa-solid fa-ship', 'fa-solid fa-bicycle',
  'fa-solid fa-motorcycle', 'fa-solid fa-truck', 'fa-solid fa-helicopter',
  'fa-solid fa-sailboat', 'fa-solid fa-tractor',
  
  // Безопасность
  'fa-solid fa-shield', 'fa-solid fa-shield-halved', 'fa-solid fa-shield-heart',
  'fa-solid fa-lock', 'fa-solid fa-lock-open', 'fa-solid fa-key', 'fa-solid fa-user-lock',
  'fa-solid fa-user-shield', 'fa-solid fa-user-secret', 'fa-solid fa-eye',
  'fa-solid fa-eye-slash', 'fa-solid fa-fingerprint',
  
  // Прочее
  'fa-solid fa-bolt', 'fa-solid fa-flame', 'fa-solid fa-droplet', 'fa-solid fa-spray-can',
  'fa-solid fa-soap', 'fa-solid fa-hand', 'fa-solid fa-hands', 'fa-solid fa-brain',
  'fa-solid fa-lungs', 'fa-solid fa-bone', 'fa-solid fa-tooth', 'fa-solid fa-magnet',
  'fa-solid fa-recycle', 'fa-solid fa-trash', 'fa-solid fa-trash-can',
  'fa-solid fa-gear', 'fa-solid fa-gears', 'fa-solid fa-wrench', 'fa-solid fa-screwdriver-wrench',
  'fa-solid fa-toolbox', 'fa-solid fa-lightbulb', 'fa-solid fa-battery-full',
  'fa-solid fa-plug', 'fa-solid fa-wifi', 'fa-solid fa-signal', 'fa-solid fa-bluetooth',
  'fa-solid fa-qrcode', 'fa-solid fa-barcode', 'fa-solid fa-print',
  'fa-solid fa-download', 'fa-solid fa-upload', 'fa-solid fa-share-nodes',
  'fa-solid fa-link', 'fa-solid fa-paperclip', 'fa-solid fa-scissors',
]

// ==================== COMPUTED ====================

const hasIconPicker = computed(() => 
  props.fields.some(f => f.type === 'icon-picker')
)

const getFilteredIcons = (fieldKey: string) => {
  const search = (iconSearch[fieldKey] || '').toLowerCase().trim()
  if (!search) {
    return allIcons.slice(0, 80)
  }
  return allIcons.filter(icon => 
    icon.toLowerCase().includes(search)
  )
}

// ==================== WATCHERS ====================

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      Object.keys(errors).forEach(key => delete errors[key])
      generalError.value = null
      
      props.fields.forEach(field => {
        localValues[field.key] = field.value
        if (field.type === 'icon-picker') {
          iconSearch[field.key] = ''
        }
      })
      
      document.body.style.overflow = 'hidden'
      
      await nextTick()
      const firstInput = modalRef.value?.querySelector(
        'input:not([disabled]):not([type="checkbox"]), textarea:not([disabled]), select:not([disabled])'
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
  
  if (e.key === 'Escape') {
    if (!isSaving.value) {
      handleClose()
    }
    return
  }
  
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
  if (field.required) {
    if (value === undefined || value === null || value === '') {
      return 'Обязательное поле'
    }
    if (typeof value === 'string' && !value.trim()) {
      return 'Обязательное поле'
    }
  }

  if (field.type === 'email' && value && String(value).trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(value))) {
      return 'Неверный формат email'
    }
  }

  if (field.type === 'url' && value && String(value).trim()) {
    try {
      new URL(String(value))
    } catch {
      return 'Неверный формат URL'
    }
  }

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

  if (field.validate) {
    return field.validate(value)
  }

  return null
}

const validateAll = (): boolean => {
  let isValid = true
  
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

const handleInput = (key: string, event: Event | any) => {
  let value: any
  
  if (event && event.target) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      value = target.checked
    } else if (target instanceof HTMLInputElement && target.type === 'number') {
      value = target.value === '' ? '' : Number(target.value)
    } else {
      value = target.value
    }
  } else {
    value = event
  }
  
  localValues[key] = value
  
  if (errors[key]) {
    delete errors[key]
  }
}

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
  if (!validateAll()) {
    generalError.value = 'Пожалуйста, исправьте ошибки в форме'
    
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

/* Скроллбар для icon picker */
.icon-picker-scroll::-webkit-scrollbar {
  width: 6px;
}

.icon-picker-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 3px;
}

.icon-picker-scroll::-webkit-scrollbar-thumb {
  background: rgba(168, 201, 107, 0.2);
  border-radius: 3px;
}

.icon-picker-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 201, 107, 0.4);
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

/* Анимация ошибок */
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