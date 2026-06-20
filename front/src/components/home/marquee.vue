<template>
  <section class="relative w-full overflow-hidden backdrop-blur-sm py-4">
    
    <!-- Блок предупреждения (только для админа) -->
    <div
      v-if="authStore.isAdmin"
      class="group/warning mx-6 mb-4 flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-3 backdrop-blur-sm transition-all hover:border-warning/50 hover:bg-warning/15"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
          <i class="fa-solid fa-triangle-exclamation text-warning text-sm"></i>
        </div>
        <div>
          <p class="text-cream-100 text-xs font-medium">
            Управление бегущей строкой
          </p>
          <p class="text-cream-100/60 text-[10px] mt-0.5">
            Редактируйте элементы или добавьте новые
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="text-cream-100/60 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/5 flex items-center gap-1.5 text-xs"
          title="Добавить элемент"
          @click="openNewItemModal"
        >
          <i class="fa-solid fa-plus text-xs"></i>
          <span>Добавить</span>
        </button>
        <button
          class="text-cream-100/40 hover:text-accent transition-colors duration-smooth p-1.5 rounded-lg hover:bg-white/5"
          title="Обновить"
          @click="loadTickerItems"
        >
          <i class="fa-solid fa-rotate text-xs"></i>
        </button>
      </div>
    </div>

    <!-- Градиентные маски по краям -->
    <div class="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-forest-400/80 to-transparent" />
    <div class="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-forest-400/80 to-transparent" />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-2">
      <i class="fa-solid fa-circle-notch fa-spin text-forest-900/60 text-sm"></i>
      <span class="ml-2 text-forest-900/60 text-xs">Загрузка...</span>
    </div>

    <!-- Бегущая строка -->
    <div v-else-if="activeItems.length > 0" class="marquee-wrap flex overflow-hidden">
      <div class="marquee-track flex whitespace-nowrap">
        <!-- Дублируем контент дважды для бесшовной анимации -->
        <template v-for="n in 2" :key="n">
          <span 
            v-for="item in activeItems" 
            :key="`${n}-${item.id}`"
            class="group/zone relative flex items-center px-8 text-sm font-medium uppercase tracking-wider text-forest-900"
          >
            <a 
              v-if="item.link" 
              :href="item.link" 
              class="hover:text-accent transition-colors"
              @click.stop
            >
              {{ item.text }}
            </a>
            <span v-else>{{ item.text }}</span>
            <span class="ml-8 opacity-60">✦</span>
            
            <!-- Админские иконки (только для админа) -->
            <template v-if="authStore.isAdmin">
              <span class="ml-3 flex items-center gap-2 opacity-0 group-hover/zone:opacity-100 transition-opacity duration-200">
                <button
                  class="text-cream-100/60 hover:text-accent transition-colors p-1 rounded hover:bg-white/10"
                  title="Редактировать"
                  @click.stop="openItemEditModal(item)"
                >
                  <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button
                  class="text-cream-100/60 hover:text-error transition-colors p-1 rounded hover:bg-white/10"
                  title="Удалить"
                  @click.stop="deleteItem(item)"
                >
                  <i class="fa-solid fa-trash text-xs"></i>
                </button>
              </span>
            </template>
          </span>
        </template>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="flex items-center justify-center py-2">
      <p class="text-forest-900/60 text-xs">Бегущая строка пуста</p>
    </div>

    <!-- EditModal для элемента -->
    <EditModal
      :visible="isItemEditModalOpen"
      :title="itemEditModalTitle"
      :subtitle="itemEditModalSubtitle"
      :fields="itemEditFields"
      @close="closeItemEditModal"
      @save="handleItemEditSave"
    />
  </section>
</template> 

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EditModal from '@/components/overlay/EditModal.vue'

import { useAuthStore } from '@/stores/auth'
import { tickerService, type TickerItem } from '@/services/ticker.service' // ✅ Правильный импорт!

const authStore = useAuthStore()

// ==================== СОСТОЯНИЕ ====================

const isLoading = ref(true)
const isSaving = ref(false)
const tickerItems = ref<TickerItem[]>([])

// Модалка
const isItemEditModalOpen = ref(false)
const itemEditModalTitle = ref('Редактирование элемента')
const itemEditModalSubtitle = ref('Измените текст элемента')
const editingItem = ref<TickerItem | null>(null)
const isNewItem = ref(false)

// ==================== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ====================

// Только активные элементы для отображения
const activeItems = computed(() => 
  tickerItems.value.filter(item => item.isActive)
)

// Поля для редактирования
// Поля для редактирования
const itemEditFields = computed(() => [
  {
    key: 'text',
    label: 'Текст',
    type: 'text' as const,
    value: editingItem.value?.text || '',
    placeholder: 'Например: Африканская саванна',
    required: true,
    hint: 'Текст, отображаемый в бегущей строке',
    icon: 'fa-solid fa-font',
  },
  {
    key: 'icon',
    label: 'Иконка',
    type: 'icon-picker' as const,  // ← ИЗМЕНИЛИ С 'text' НА 'icon-picker'
    value: editingItem.value?.icon || '',
    hint: 'Выберите иконку из списка для отображения перед текстом',
  },
  {
    key: 'link',
    label: 'Ссылка (опционально)',
    type: 'url' as const,
    value: editingItem.value?.link || '',
    placeholder: 'https://example.com',
    hint: 'Если указать — текст станет кликабельным',
    icon: 'fa-solid fa-link',
  },
  {
    key: 'displayOrder',
    label: 'Порядок отображения',
    type: 'number' as const,
    value: editingItem.value?.displayOrder ?? 0,
    placeholder: '0',
    hint: 'Чем меньше число, тем раньше элемент',
    icon: 'fa-solid fa-sort',
  },
  {
    key: 'speed',
    label: 'Скорость анимации',
    type: 'number' as const,
    value: editingItem.value?.speed ?? 30,
    placeholder: '30',
    hint: 'В секундах (меньше = быстрее)',
    icon: 'fa-solid fa-gauge',
  },
  {
    key: 'isActive',
    label: 'Активен',
    type: 'checkbox' as const,
    value: editingItem.value?.isActive ?? true,
    hint: 'Активные элементы отображаются в строке',
    icon: 'fa-solid fa-toggle-on',
  },
])

// ==================== ЗАГРУЗКА ДАННЫХ ====================

const loadTickerItems = async () => {
  isLoading.value = true
  
  try {
    const response = await tickerService.getAll()
    tickerItems.value = response.items
  } catch (error: any) {
    console.error('Error loading ticker:', error)
    ElMessage.error('Ошибка загрузки бегущей строки')
  } finally {
    isLoading.value = false
  }
}

// ==================== CRUD ОПЕРАЦИИ ====================

const openItemEditModal = (item: TickerItem) => {
  editingItem.value = item
  isNewItem.value = false
  itemEditModalTitle.value = 'Редактирование элемента'
  itemEditModalSubtitle.value = `Редактирование: ${item.text}`
  isItemEditModalOpen.value = true
}

const openNewItemModal = () => {
  editingItem.value = null
  isNewItem.value = true
  itemEditModalTitle.value = 'Добавить новый элемент'
  itemEditModalSubtitle.value = 'Заполните данные нового элемента'
  isItemEditModalOpen.value = true
}

const closeItemEditModal = () => {
  isItemEditModalOpen.value = false
  editingItem.value = null
  isNewItem.value = false
}

const handleItemEditSave = async (values: Record<string, any>) => {
  if (isSaving.value) return
  isSaving.value = true
  
  try {
    const data = {
      text: values.text,
      link: values.link || null,
      icon: values.icon || null,
      displayOrder: Number(values.displayOrder) || 0,
      speed: Number(values.speed) || 30,
      isActive: values.isActive ?? true,
    }
    
    if (isNewItem.value) {
      await tickerService.create(data)
      ElMessage.success(`Элемент "${values.text}" добавлен`)
    } else if (editingItem.value) {
      await tickerService.update(editingItem.value.id, data)
      ElMessage.success(`Элемент "${values.text}" обновлён`)
    }
    
    await loadTickerItems()
    closeItemEditModal()
  } catch (error: any) {
    console.error('Save error:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  } finally {
    isSaving.value = false
  }
}

const deleteItem = async (item: TickerItem) => {
  try {
    await ElMessageBox.confirm(
      `Удалить элемент "${item.text}"?`,
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'bg-red-500 hover:bg-red-600',
      }
    )
    
    await tickerService.delete(item.id)
    ElMessage.success(`Элемент "${item.text}" удалён`)
    await loadTickerItems()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  }
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadTickerItems()
})
</script>

<style scoped>
.marquee-track {
  animation: marquee 25s linear infinite;
}

.marquee-wrap:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>