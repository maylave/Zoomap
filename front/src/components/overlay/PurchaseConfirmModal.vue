<template>
  <Transition name="fade">
    <div
      v-if="visible && eventData"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click="$emit('close')"
    >
      <div
        class="bg-forest-900 relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10"
        @click.stop
      >
        <!-- Close Button -->
        <button
          class="text-cream-100 absolute top-4 right-4 z-10 rounded-full bg-black/20 p-2 transition hover:bg-black/40"
          @click="$emit('close')"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Header -->
        <div class="border-b border-white/10 p-8 pb-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl" :class="eventData.dateBg">
              <AppIcon :name="eventData.icon" class="size-6 text-white" />
            </div>
            <div>
              <h3 class="text-cream-100 text-2xl font-bold">Подтверждение покупки</h3>
              <p class="text-cream-100/60 text-sm">Вы собираетесь забронировать место</p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="space-y-6 p-8">
          <!-- Event Details -->
          <div class="rounded-xl border border-white/10 bg-white/5 p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h4 class="text-cream-100 text-lg font-bold mb-2">{{ eventData.title }}</h4>
                <div class="flex items-center gap-3 text-sm">
                  <span class="text-cream-100/60">
                    <i class="fa-solid fa-calendar mr-1"></i>
                    {{ eventData.day }} {{ eventData.month }}
                  </span>
                  <span class="text-cream-100/40">•</span>
                  <span :class="eventData.categoryColor" class="font-medium">
                    {{ eventData.category }}
                  </span>
                </div>
              </div>
            </div>

            <p class="text-cream-100/60 text-sm leading-relaxed mb-4">
              {{ eventData.description }}
            </p>

            <div class="border-t border-white/10 pt-4 flex items-center justify-between">
              <span class="text-cream-100/60 text-sm">Стоимость:</span>
              <div class="text-right">
                <div class="text-accent text-2xl font-bold">{{ eventData.price }}</div>
                <div class="text-cream-100/40 text-xs">{{ eventData.priceLabel }}</div>
              </div>
            </div>
          </div>

          <!-- Warning -->
          <div class="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
            <i class="fa-solid fa-circle-info text-warning mt-0.5"></i>
            <div class="flex-1">
              <p class="text-cream-100 text-sm font-medium">Обратите внимание</p>
              <p class="text-cream-100/60 text-xs mt-1">
                После подтверждения бронирования отмена возможна не позднее чем за 24 часа до начала мероприятия
              </p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              class="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-cream-100 transition hover:bg-white/10"
              @click="$emit('close')"
            >
              Отмена
            </button>
            <button
              class="btn btn-accent flex-1 rounded-xl py-3 font-bold disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
              :disabled="isPurchasing"
              @click="handlePurchase"
            >
              <svg
                v-if="isPurchasing"
                class="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="isPurchasing">Покупка...</span>
              <span v-else>Купить</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/ui/BaseIcon.vue'

interface EventItem {
  id?: number
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

const props = defineProps<{
  visible: boolean
  eventData: EventItem | null
}>()

const emit = defineEmits<{
  close: []
  purchased: []
}>()

const router = useRouter()
const authStore = useAuthStore()
const isPurchasing = ref(false)

async function handlePurchase() {
  // Проверка авторизации
  if (!authStore.isAuthenticated) {
    ElMessage.warning('Для покупки необходимо авторизоваться')
    emit('close')
    setTimeout(() => {
      router.push('/login')
    }, 300)
    return
  }

  isPurchasing.value = true
  
  try {
    // Здесь ваша логика покупки
    // await eventsService.purchase(props.eventData.id)
    
    // Имитация запроса
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    ElMessage.success('Билет успешно куплен!')
    emit('purchased')
    emit('close')
  } catch (error) {
    console.error('Ошибка покупки:', error)
    ElMessage.error('Произошла ошибка при покупке билета')
  } finally {
    isPurchasing.value = false
  }
}
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

.fade-enter-active .relative,
.fade-leave-active .relative {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.fade-enter-from .relative,
.fade-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>