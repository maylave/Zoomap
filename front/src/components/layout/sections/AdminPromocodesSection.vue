<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminPromocodesService, type AdminPromocode } from '@/services/adminPromocodes.service'

const promocodes = ref<AdminPromocode[]>([])
const isLoading = ref(true)
const stats = ref({ total: 0, active: 0, totalUsage: 0, used: 0 })

// Модалка генерации
const showGenerateModal = ref(false)
const generateForm = ref({
  quantity: 1,
  discount: 10,
  discountType: 'percent' as 'percent' | 'fixed',
  description: '',
  usageLimit: null as number | null,
  validDays: 30,
  minOrderAmount: null as number | null,
  prefix: 'ZOO',
})

// Модалка выдачи
const showGrantModal = ref(false)
const grantForm = ref({
  promocodeId: null as number | null,
  userId: null as number | null,
  expiresDays: 30,
  grantToAll: false,
})

// Поиск
const searchQuery = ref('')

// Фильтр
const statusFilter = ref<'all' | 'active' | 'inactive' | 'expired'>('all')

const filteredPromocodes = computed(() => {
  return promocodes.value.filter((p) => {
    const matchesSearch =
      !searchQuery.value ||
      p.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStatusConfig = (status: AdminPromocode['status']) => {
  const configs = {
    active: {
      label: 'Активен',
      class: 'bg-amber/20 text-amber border-amber/30',
      icon: 'fa-solid fa-check',
    },
    inactive: {
      label: 'Неактивен',
      class: 'bg-white/10 text-cream-100/60 border-white/10',
      icon: 'fa-solid fa-pause',
    },
    expired: {
      label: 'Истёк',
      class: 'bg-terracotta/20 text-terracotta border-terracotta/30',
      icon: 'fa-solid fa-clock',
    },
  }
  return configs[status] || configs.active
}

const formatDiscount = (promo: AdminPromocode) => {
  return promo.discountType === 'percent' ? `${promo.discount}%` : `${promo.discount} ₽`
}

// ==================== ЗАГРУЗКА ====================

const loadData = async () => {
  isLoading.value = true
  try {
    const [promosResponse, statsResponse] = await Promise.all([
      adminPromocodesService.getAll(),
      adminPromocodesService.getStats(),
    ])
    promocodes.value = promosResponse.promocodes || []
    stats.value = statsResponse
  } catch (error: any) {
    console.error('Error loading promocodes:', error)
    ElMessage.error('Ошибка загрузки промокодов')
  } finally {
    isLoading.value = false
  }
}

// ==================== ГЕНЕРАЦИЯ ====================

const openGenerateModal = () => {
  generateForm.value = {
    quantity: 1,
    discount: 10,
    discountType: 'percent',
    description: '',
    usageLimit: null,
    validDays: 30,
    minOrderAmount: null,
    prefix: 'ZOO',
  }
  showGenerateModal.value = true
}

const generatePromocodes = async () => {
  if (generateForm.value.discount <= 0) {
    ElMessage.error('Укажите размер скидки')
    return
  }

  try {
    const validFrom = new Date().toISOString()
    const validUntil = new Date(
      Date.now() + generateForm.value.validDays * 24 * 60 * 60 * 1000
    ).toISOString()

    const result = await adminPromocodesService.generate({
      quantity: generateForm.value.quantity,
      discount: generateForm.value.discount,
      discountType: generateForm.value.discountType,
      description: generateForm.value.description || `Скидка ${generateForm.value.discount}${generateForm.value.discountType === 'percent' ? '%' : '₽'}`,
      usageLimit: generateForm.value.usageLimit || undefined,
      validFrom,
      validUntil,
      minOrderAmount: generateForm.value.minOrderAmount || undefined,
      prefix: generateForm.value.prefix,
    })

    ElMessage.success(`Создано ${result.total} промокодов`)
    showGenerateModal.value = false
    await loadData()
  } catch (error: any) {
    console.error('Error generating:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка генерации')
  }
}

// ==================== ВЫДАЧА ====================

const openGrantModal = (promocodeId?: number) => {
  grantForm.value = {
    promocodeId: promocodeId || null,
    userId: null,
    expiresDays: 30,
    grantToAll: false,
  }
  showGrantModal.value = true
}

const grantPromocode = async () => {
  if (!grantForm.value.promocodeId) {
    ElMessage.error('Выберите промокод')
    return
  }

  try {
    if (grantForm.value.grantToAll) {
      const result = await adminPromocodesService.grantAll(
        grantForm.value.promocodeId,
        grantForm.value.expiresDays
      )
      ElMessage.success(result.message)
    } else {
      if (!grantForm.value.userId) {
        ElMessage.error('Укажите ID пользователя')
        return
      }
      await adminPromocodesService.grant({
        promocodeId: grantForm.value.promocodeId,
        userId: grantForm.value.userId,
        expiresDays: grantForm.value.expiresDays,
      })
      ElMessage.success('Промокод выдан')
    }

    showGrantModal.value = false
    await loadData()
  } catch (error: any) {
    console.error('Error granting:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка выдачи')
  }
}

// ==================== УДАЛЕНИЕ ====================

const deletePromocode = async (promo: AdminPromocode) => {
  try {
    await ElMessageBox.confirm(
      `Удалить промокод "${promo.code}"?`,
      'Подтверждение',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'bg-terracotta hover:bg-terracotta/90',
      }
    )

    await adminPromocodesService.delete(promo.id)
    ElMessage.success('Промокод удалён')
    await loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  }
}

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('Код скопирован')
  } catch (error) {
    ElMessage.error('Не удалось скопировать')
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Статистика -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-ticket text-cream-100/40"></i>
          Всего
        </div>
        <div class="mt-1 text-2xl font-bold text-cream-100">{{ stats.total }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-check text-amber"></i>
          Активных
        </div>
        <div class="mt-1 text-2xl font-bold text-amber">{{ stats.active }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-gift text-lime"></i>
          Выдано
        </div>
        <div class="mt-1 text-2xl font-bold text-lime">{{ stats.totalUsage }}</div>
      </div>

      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-2 text-sm text-cream-100/50">
          <i class="fa-solid fa-circle-check text-sage"></i>
          Использовано
        </div>
        <div class="mt-1 text-2xl font-bold text-sage">{{ stats.used }}</div>
      </div>
    </div>

    <!-- Панель управления -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6">
      <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative max-w-md flex-1">
          <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-cream-100/30"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по коду..."
            class="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-cream-100 placeholder:text-cream-100/40 outline-none focus:border-amber/50"
          />
        </div>

        <div class="flex gap-2 flex-wrap">
          <button
            v-for="status in [
              { value: 'all', label: 'Все' },
              { value: 'active', label: 'Активные' },
              { value: 'inactive', label: 'Неактивные' },
              { value: 'expired', label: 'Истёкшие' },
            ]"
            :key="status.value"
            class="rounded-lg px-3 py-1.5 text-sm font-medium transition"
            :class="
              statusFilter === status.value
                ? 'bg-amber text-forest-900'
                : 'border border-white/10 text-cream-100/70 hover:bg-white/5'
            "
            @click="statusFilter = status.value as any"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="mb-4 flex gap-2 flex-wrap">
        <button
          @click="openGenerateModal"
          class="rounded-xl border border-amber/30 bg-amber/10 px-4 py-2 text-sm font-medium text-amber hover:bg-amber/20 transition"
        >
          <i class="fa-solid fa-wand-magic-sparkles mr-2"></i>
          Генерировать промокоды
        </button>
        <button
          @click="openGrantModal()"
          class="rounded-xl border border-lime/30 bg-lime/10 px-4 py-2 text-sm font-medium text-lime hover:bg-lime/20 transition"
        >
          <i class="fa-solid fa-gift mr-2"></i>
          Выдать промокод
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-amber"></i>
      </div>

      <!-- Список промокодов -->
      <div v-else class="space-y-3">
        <div
          v-for="promo in filteredPromocodes"
          :key="promo.id"
          class="group rounded-xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-white/10 hover:bg-white/5"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-4 flex-1">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber/10">
                <i class="fa-solid fa-ticket text-amber text-2xl"></i>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 class="font-mono text-lg font-bold text-cream-100">
                    {{ promo.code }}
                  </h4>
                  <span
                    class="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
                    :class="getStatusConfig(promo.status).class"
                  >
                    <i :class="getStatusConfig(promo.status).icon" class="mr-1"></i>
                    {{ getStatusConfig(promo.status).label }}
                  </span>
                </div>

                <p class="text-sm text-cream-100/60 mb-2">{{ promo.description }}</p>

                <div class="flex flex-wrap items-center gap-3 text-xs text-cream-100/40">
                  <span>
                    <i class="fa-solid fa-calendar mr-1"></i>
                    Создан: {{ formatDate(promo.createdAt) }}
                  </span>
                  <span class="text-cream-100/20">•</span>
                  <span>
                    <i class="fa-solid fa-hourglass-end mr-1"></i>
                    Действует до: {{ formatDate(promo.validUntil) }}
                  </span>
                  <span class="text-cream-100/20">•</span>
                  <span>
                    <i class="fa-solid fa-users mr-1"></i>
                    Выдано: {{ promo.grantedCount }}
                  </span>
                  <span class="text-cream-100/20">•</span>
                  <span>
                    <i class="fa-solid fa-check mr-1"></i>
                    Использовано: {{ promo.usedCount }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 sm:flex-col sm:items-end">
              <div class="text-right">
                <div class="text-3xl font-bold text-amber">
                  {{ formatDiscount(promo) }}
                </div>
                <div class="text-xs text-cream-100/50">
                  {{ promo.discountType === 'percent' ? 'скидка' : 'выгода' }}
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="copyCode(promo.code)"
                  class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-cream-100/70 hover:bg-white/10 transition"
                  title="Копировать"
                >
                  <i class="fa-solid fa-copy"></i>
                </button>
                <button
                  @click="openGrantModal(promo.id)"
                  class="rounded-lg border border-lime/30 bg-lime/10 px-3 py-1.5 text-xs text-lime hover:bg-lime/20 transition"
                  title="Выдать"
                >
                  <i class="fa-solid fa-gift"></i>
                </button>
                <button
                  @click="deletePromocode(promo)"
                  class="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-1.5 text-xs text-terracotta hover:bg-terracotta/20 transition"
                  title="Удалить"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredPromocodes.length === 0" class="py-12 text-center">
          <i class="fa-solid fa-ticket text-5xl text-cream-100/20 mb-3"></i>
          <div class="text-cream-100/50">Промокоды не найдены</div>
        </div>
      </div>
    </div>

    <!-- Модалка генерации -->
    <Transition name="modal-backdrop">
      <div
        v-if="showGenerateModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        @click="showGenerateModal = false"
      >
        <div
          @click.stop
          class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl"
        >
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber/20 text-amber">
              <i class="fa-solid fa-wand-magic-sparkles text-lg"></i>
            </div>
            <h3 class="text-lg font-bold text-cream-100">Генерация промокодов</h3>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  Количество
                </label>
                <input
                  v-model.number="generateForm.quantity"
                  type="number"
                  min="1"
                  max="100"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  Префикс
                </label>
                <input
                  v-model="generateForm.prefix"
                  type="text"
                  placeholder="ZOO"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  Размер скидки
                </label>
                <input
                  v-model.number="generateForm.discount"
                  type="number"
                  min="1"
                  :max="generateForm.discountType === 'percent' ? 100 : 10000"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  Тип скидки
                </label>
                <select
                  v-model="generateForm.discountType"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
                >
                  <option value="percent">Процент (%)</option>
                  <option value="fixed">Фиксированная (₽)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-cream-100/80 mb-2">
                Описание
              </label>
              <input
                v-model="generateForm.description"
                type="text"
                :placeholder="`Скидка ${generateForm.discount}${generateForm.discountType === 'percent' ? '%' : '₽'}`"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  Срок действия (дней)
                </label>
                <input
                  v-model.number="generateForm.validDays"
                  type="number"
                  min="1"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-cream-100/80 mb-2">
                  Лимит использований
                </label>
                <input
                  v-model.number="generateForm.usageLimit"
                  type="number"
                  min="1"
                  placeholder="Без лимита"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-cream-100/80 mb-2">
                Минимальная сумма заказа (₽)
              </label>
              <input
                v-model.number="generateForm.minOrderAmount"
                type="number"
                min="0"
                placeholder="Без ограничений"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-amber/50 outline-none"
              />
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              @click="showGenerateModal = false"
              class="w-full rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-cream-100/80 hover:bg-white/5 sm:w-auto"
            >
              Отмена
            </button>
            <button
              @click="generatePromocodes"
              class="w-full rounded-full border border-amber/30 bg-gradient-to-r from-amber/20 to-amber/10 px-4 py-2.5 text-sm font-semibold text-amber hover:shadow-lg sm:w-auto"
            >
              <i class="fa-solid fa-wand-magic-sparkles mr-1"></i>
              Генерировать
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Модалка выдачи -->
    <Transition name="modal-backdrop">
      <div
        v-if="showGrantModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        @click="showGrantModal = false"
      >
        <div
          @click.stop
          class="w-full max-w-md rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-6 shadow-2xl"
        >
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-lime/20 text-lime">
              <i class="fa-solid fa-gift text-lg"></i>
            </div>
            <h3 class="text-lg font-bold text-cream-100">Выдать промокод</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-cream-100/80 mb-2">
                Выберите промокод
              </label>
              <select
                v-model.number="grantForm.promocodeId"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-lime/50 outline-none"
              >
                <option :value="null" disabled>Выберите промокод</option>
                <option
                  v-for="promo in promocodes.filter(p => p.status === 'active')"
                  :key="promo.id"
                  :value="promo.id"
                >
                  {{ promo.code }} — {{ formatDiscount(promo) }}
                </option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="grantForm.grantToAll"
                type="checkbox"
                id="grantToAll"
                class="h-4 w-4 rounded border-white/20 bg-white/5 text-lime"
              />
              <label for="grantToAll" class="text-sm text-cream-100/80">
                Выдать всем пользователям
              </label>
            </div>

            <div v-if="!grantForm.grantToAll">
              <label class="block text-sm font-medium text-cream-100/80 mb-2">
                ID пользователя
              </label>
              <input
                v-model.number="grantForm.userId"
                type="number"
                min="1"
                placeholder="Введите ID"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-lime/50 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-cream-100/80 mb-2">
                Срок действия (дней)
              </label>
              <input
                v-model.number="grantForm.expiresDays"
                type="number"
                min="1"
                class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-cream-100 focus:border-lime/50 outline-none"
              />
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              @click="showGrantModal = false"
              class="w-full rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-cream-100/80 hover:bg-white/5 sm:w-auto"
            >
              Отмена
            </button>
            <button
              @click="grantPromocode"
              class="w-full rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-lime/10 px-4 py-2.5 text-sm font-semibold text-lime hover:shadow-lg sm:w-auto"
            >
              <i class="fa-solid fa-gift mr-1"></i>
              Выдать
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
</style>