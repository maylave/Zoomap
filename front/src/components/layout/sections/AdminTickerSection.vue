<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 sm:p-6">
      <div class="mb-4 flex justify-between items-center">
        <div>
          <h3 class="text-lg font-bold text-cream-100">Бегущая строка</h3>
          <p class="text-sm text-cream-100/60">Всего элементов: {{ items.length }}</p>
        </div>
        <button 
          @click="openCreateModal" 
          class="rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime hover:shadow-lg transition"
        >
          <i class="fa-solid fa-plus mr-2"></i>
          Добавить элемент
        </button>
      </div>

      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <div v-else-if="items.length === 0" class="py-12 text-center">
        <i class="fa-solid fa-inbox text-5xl text-cream-100/20 mb-3"></i>
        <p class="text-cream-100/60">Элементы бегущей строки не добавлены</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center justify-between rounded-xl border border-sage/15 bg-forest-400/40 p-3 transition hover:border-sage/30"
        >
          <div class="flex items-center gap-3 flex-1">
            <span class="text-cream-100/40 font-mono">#{{ item.displayOrder }}</span>
            <div class="flex items-center gap-2 flex-1">
              <i v-if="item.icon" :class="item.icon" class="text-lime"></i>
              <span class="text-cream-100">{{ item.text }}</span>
            </div>
            <span 
              class="rounded-full px-3 py-1 text-xs font-medium" 
              :class="item.isActive ? 'bg-lime/20 text-lime' : 'bg-terracotta/20 text-terracotta'"
            >
              {{ item.isActive ? 'Активен' : 'Скрыт' }}
            </span>
          </div>
          <div class="flex gap-1 ml-4">
            <button 
              @click="toggleActive(item)" 
              class="rounded-lg p-2 text-cream-100/60 hover:bg-amber/10 hover:text-amber transition"
              :title="item.isActive ? 'Деактивировать' : 'Активировать'"
            >
              <i :class="item.isActive ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'" class="text-sm"></i>
            </button>
            <button 
              @click="openEditModal(item)" 
              class="rounded-lg p-2 text-cream-100/60 hover:bg-lime/10 hover:text-lime transition"
            >
              <i class="fa-solid fa-pen text-sm"></i>
            </button>
            <button 
              @click="deleteItem(item.id)" 
              class="rounded-lg p-2 text-cream-100/60 hover:bg-terracotta/15 hover:text-terracotta transition"
            >
              <i class="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal-backdrop">
      <div 
        v-if="showModal" 
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        @click="closeModal"
      >
        <div 
          @click.stop 
          class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl"
        >
          <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-lime/20 text-lime">
                <i :class="editingItem ? 'fa-solid fa-pen' : 'fa-solid fa-plus'" class="text-lg"></i>
              </div>
              <h3 class="text-lg font-bold text-cream-100">
                {{ editingItem ? 'Редактировать элемент' : 'Новый элемент' }}
              </h3>
            </div>
            <button @click="closeModal" class="text-cream-100/60 hover:text-cream-100">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Текст -->
            <div>
              <label class="block text-sm font-medium text-cream-100/80 mb-2">
                <i class="fa-solid fa-text mr-1"></i>
                Текст *
              </label>
              <input
                v-model="form.text"
                type="text"
                placeholder="Введите текст бегущей строки"
                class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100 placeholder:text-cream-100/40 focus:border-lime/50 focus:outline-none"
              />
            </div>

            <!-- Выбор иконки -->
            <div>
              <label class="block text-sm font-medium text-cream-100/80 mb-2">
                <i class="fa-solid fa-icons mr-1"></i>
                Иконка
              </label>
              
              <!-- Поиск иконок -->
              <div class="relative mb-3">
                <input
                  v-model="iconSearch"
                  type="text"
                  placeholder=" Поиск иконок..."
                  class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 pl-10 text-cream-100 placeholder:text-cream-100/40 focus:border-lime/50 focus:outline-none"
                />
                <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/40"></i>
              </div>

              <!-- Выбранная иконка -->
              <div v-if="form.icon" class="mb-3 flex items-center gap-3 rounded-xl border border-sage/20 bg-forest-400/40 p-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-lime/20 text-lime">
                  <i :class="form.icon" class="text-2xl"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-cream-100">{{ form.icon }}</p>
                  <p class="text-xs text-cream-100/60">Выбранная иконка</p>
                </div>
                <button 
                  @click="form.icon = ''"
                  class="rounded-lg p-2 text-terracotta hover:bg-terracotta/10"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <!-- Сетка иконок -->
              <div class="max-h-64 overflow-y-auto rounded-xl border border-sage/20 bg-forest-400/40 p-3">
                <div class="grid grid-cols-8 gap-2">
                  <button
                    v-for="icon in filteredIcons"
                    :key="icon"
                    @click="form.icon = icon"
                    class="flex aspect-square items-center justify-center rounded-lg border border-sage/20 bg-forest-300/40 text-cream-100/60 transition hover:border-lime/40 hover:bg-lime/10 hover:text-lime hover:scale-110"
                    :class="{ 'border-lime/40 bg-lime/10 text-lime': form.icon === icon }"
                    :title="icon"
                  >
                    <i :class="icon" class="text-lg"></i>
                  </button>
                </div>
                <p class="mt-2 text-center text-xs text-cream-100/40">
                  {{ filteredIcons.length }} иконок доступно
                </p>
              </div>
            </div>

            <!-- Порядок и скорость -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  <i class="fa-solid fa-sort mr-1"></i>
                  Порядок
                </label>
                <input
                  v-model.number="form.displayOrder"
                  type="number"
                  class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100 focus:border-lime/50 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  <i class="fa-solid fa-gauge mr-1"></i>
                  Скорость
                </label>
                <input
                  v-model.number="form.speed"
                  type="number"
                  placeholder="30"
                  class="w-full rounded-xl border border-sage/20 bg-forest-400/60 px-4 py-2 text-cream-100 focus:border-lime/50 focus:outline-none"
                />
              </div>
            </div>

            <!-- Чекбокс активности -->
            <div class="flex items-center gap-2 rounded-xl border border-sage/20 bg-forest-400/40 p-3">
              <input
                v-model="form.isActive"
                type="checkbox"
                id="isActive"
                class="h-4 w-4 rounded border-sage/20 bg-forest-400/60 text-lime focus:ring-lime/50"
              />
              <label for="isActive" class="flex-1 text-sm text-cream-100/80">
                Активен (показывать на сайте)
              </label>
              <i :class="form.isActive ? 'fa-solid fa-circle-check text-lime' : 'fa-solid fa-circle-xmark text-terracotta'" class="text-xl"></i>
            </div>
          </div>

          <!-- Кнопки -->
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button 
              class="w-full rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2.5 text-sm font-medium text-cream-100/80 transition hover:bg-forest-300/50 sm:w-auto" 
              @click="closeModal"
            >
              Отмена
            </button>
            <button 
              class="w-full rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2.5 text-sm font-semibold text-lime shadow-[0_0_16px_rgba(168,201,107,0.2)] transition hover:shadow-[0_0_24px_rgba(168,201,107,0.35)] sm:w-auto" 
              @click="saveItem"
            >
              <i :class="editingItem ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-plus'" class="mr-1"></i>
              {{ editingItem ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tickerService, type TickerItem } from '@/services/ticker.service'

const isLoading = ref(true)
const items = ref<TickerItem[]>([])
const showModal = ref(false)
const editingItem = ref<TickerItem | null>(null)
const iconSearch = ref('')

const form = ref({
  text: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
  speed: 30,
  zoneId: undefined as number | undefined,
})

// Большой список иконок Font Awesome
const availableIcons = [
  // Животные
  'fa-solid fa-paw',
  'fa-solid fa-dog',
  'fa-solid fa-cat',
  'fa-solid fa-crow',
  'fa-solid fa-spider',
  'fa-solid fa-fish',
  'fa-solid fa-horse',
  'fa-solid fa-cow',
  'fa-solid fa-sheep',
  'fa-solid fa-piggy-bank',
  'fa-solid fa-dove',
  'fa-solid fa-otter',
  'fa-solid fa-frog',
  'fa-solid fa-bug',
  'fa-solid fa-dragon',
  
  // Природа
  'fa-solid fa-leaf',
  'fa-solid fa-tree',
  'fa-solid fa-seedling',
  'fa-solid fa-mountain',
  'fa-solid fa-water',
  'fa-solid fa-sun',
  'fa-solid fa-moon',
  'fa-solid fa-cloud',
  'fa-solid fa-cloud-sun',
  'fa-solid fa-cloud-rain',
  'fa-solid fa-snowflake',
  'fa-solid fa-fire',
  'fa-solid fa-wind',
  'fa-solid fa-earth-americas',
  'fa-solid fa-earth-europe',
  
  // Еда
  'fa-solid fa-apple-whole',
  'fa-solid fa-carrot',
  'fa-solid fa-bread-slice',
  'fa-solid fa-cheese',
  'fa-solid fa-drumstick-bite',
  'fa-solid fa-fish-fins',
  'fa-solid fa-egg',
  'fa-solid fa-pepper-hot',
  'fa-solid fa-lemon',
  'fa-solid fa-cherry-blossom',
  
  // Действия
  'fa-solid fa-walking',
  'fa-solid fa-running',
  'fa-solid fa-person-swimming',
  'fa-solid fa-bicycle',
  'fa-solid fa-person-hiking',
  'fa-solid fa-person-skiing',
  'fa-solid fa-person-snowboarding',
  'fa-solid fa-person-biking',
  
  // Время
  'fa-solid fa-clock',
  'fa-solid fa-calendar',
  'fa-solid fa-calendar-days',
  'fa-solid fa-hourglass-start',
  'fa-solid fa-hourglass-half',
  'fa-solid fa-hourglass-end',
  'fa-solid fa-stopwatch',
  'fa-solid fa-timer',
  
  // Информация
  'fa-solid fa-circle-info',
  'fa-solid fa-circle-question',
  'fa-solid fa-circle-exclamation',
  'fa-solid fa-circle-check',
  'fa-solid fa-circle-xmark',
  'fa-solid fa-bell',
  'fa-solid fa-bell-slash',
  'fa-solid fa-star',
  'fa-solid fa-heart',
  'fa-solid fa-bookmark',
  'fa-solid fa-tag',
  'fa-solid fa-ticket',
  
  // Навигация
  'fa-solid fa-location-dot',
  'fa-solid fa-map',
  'fa-solid fa-map-pin',
  'fa-solid fa-route',
  'fa-solid fa-signs-post',
  'fa-solid fa-compass',
  'fa-solid fa-globe',
  'fa-solid fa-earth-africa',
  
  // Зоопарк
  'fa-solid fa-house-chimney',
  'fa-solid fa-building',
  'fa-solid fa-hotel',
  'fa-solid fa-person',
  'fa-solid fa-people-group',
  'fa-solid fa-child',
  'fa-solid fa-person-pregnant',
  'fa-solid fa-wheelchair',
  'fa-solid fa-person-cane',
  
  // Развлечения
  'fa-solid fa-camera',
  'fa-solid fa-video',
  'fa-solid fa-music',
  'fa-solid fa-film',
  'fa-solid fa-gamepad',
  'fa-solid fa-puzzle-piece',
  'fa-solid fa-gift',
  'fa-solid fa-trophy',
  'fa-solid fa-medal',
  
  // Покупки
  'fa-solid fa-cart-shopping',
  'fa-solid fa-credit-card',
  'fa-solid fa-money-bill',
  'fa-solid fa-money-bill-wave',
  'fa-solid fa-receipt',
  'fa-solid fa-bag-shopping',
  'fa-solid fa-basket-shopping',
  'fa-solid fa-percent',
  
  // Погода
  'fa-solid fa-temperature-high',
  'fa-solid fa-temperature-low',
  'fa-solid fa-temperature-half',
  'fa-solid fa-umbrella',
  'fa-solid fa-sun-plant-wilt',
  'fa-solid fa-cloud-showers-water',
  'fa-solid fa-rainbow',
  
  // Транспорт
  'fa-solid fa-car',
  'fa-solid fa-bus',
  'fa-solid fa-train',
  'fa-solid fa-plane',
  'fa-solid fa-ship',
  'fa-solid fa-bicycle',
  'fa-solid fa-motorcycle',
  'fa-solid fa-truck',
  
  // Безопасность
  'fa-solid fa-shield',
  'fa-solid fa-shield-halved',
  'fa-solid fa-lock',
  'fa-solid fa-lock-open',
  'fa-solid fa-key',
  'fa-solid fa-user-lock',
  'fa-solid fa-user-shield',
  
  // Прочее
  'fa-solid fa-bolt',
  'fa-solid fa-flame',
  'fa-solid fa-droplet',
  'fa-solid fa-spray-can',
  'fa-solid fa-soap',
  'fa-solid fa-hand',
  'fa-solid fa-hands',
  'fa-solid fa-eye',
  'fa-solid fa-eye-slash',
  'fa-solid fa-ear-listen',
  'fa-solid fa-brain',
  'fa-solid fa-lungs',
  'fa-solid fa-bone',
  'fa-solid fa-tooth',
]

const filteredIcons = computed(() => {
  if (!iconSearch.value) {
    return availableIcons.slice(0, 48) // Показываем первые 48 иконок
  }
  const search = iconSearch.value.toLowerCase()
  return availableIcons.filter(icon => 
    icon.toLowerCase().includes(search)
  )
})

const loadItems = async () => {
  isLoading.value = true
  try {
    const response = await tickerService.getAll()
    items.value = response.items || []
  } catch (error: any) {
    console.error('Error loading ticker items:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка загрузки')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  editingItem.value = null
  form.value = {
    text: '',
    icon: '',
    displayOrder: items.value.length + 1,
    isActive: true,
    speed: 30,
    zoneId: undefined,
  }
  iconSearch.value = ''
  showModal.value = true
}

const openEditModal = (item: TickerItem) => {
  editingItem.value = item
  form.value = {
    text: item.text,
    icon: item.icon || '',
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    speed: item.speed || 30,
    zoneId: item.zoneId,
  }
  iconSearch.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
  iconSearch.value = ''
}

const saveItem = async () => {
  if (!form.value.text.trim()) {
    ElMessage.error('Введите текст')
    return
  }

  try {
    if (editingItem.value) {
      await tickerService.update(editingItem.value.id, form.value)
      ElMessage.success('Элемент обновлён')
    } else {
      await tickerService.create(form.value)
      ElMessage.success('Элемент создан')
    }

    closeModal()
    await loadItems()
  } catch (error: any) {
    console.error('Save error:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const toggleActive = async (item: TickerItem) => {
  try {
    await tickerService.update(item.id, { isActive: !item.isActive })
    ElMessage.success(`Элемент ${!item.isActive ? 'активирован' : 'деактивирован'}`)
    await loadItems()
  } catch (error: any) {
    ElMessage.error('Ошибка обновления')
  }
}

const deleteItem = async (id: number) => {
  try {
    await ElMessageBox.confirm('Удалить этот элемент?', 'Подтверждение', {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'warning',
      confirmButtonClass: 'bg-terracotta hover:bg-terracotta/90',
    })
    await tickerService.delete(id)
    ElMessage.success('Элемент удалён')
    await loadItems()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  }
}

onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* Кастомный скроллбар для сетки иконок */
.max-h-64::-webkit-scrollbar {
  width: 6px;
}

.max-h-64::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.max-h-64::-webkit-scrollbar-thumb {
  background: rgba(168, 201, 107, 0.3);
  border-radius: 3px;
}

.max-h-64::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 201, 107, 0.5);
}
</style>