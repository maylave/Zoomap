import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ticketsService } from '@/services/tickets.service'
import { profileService } from '@/services/profile.service'
import type { TicketType, TimeSlot, Booking, BookingRequest } from '@/services/tickets.service'

export const useTicketsStore = defineStore('tickets', () => {
  // ==================== STATE ====================

  // Данные
  const ticketTypes = ref<TicketType[]>([])
  const timeSlots = ref<TimeSlot[]>([])
  const bookings = ref<Booking[]>([])
  const currentBooking = ref<Booking | null>(null)

  // Форма бронирования
  const selectedDate = ref<string>('')
  const selectedTime = ref<string>('')
  const selectedTickets = ref<Record<number, number>>({})

  // Состояние
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== COMPUTED ====================

  // Общая стоимость
  const totalPrice = computed(() => {
    return Object.entries(selectedTickets.value).reduce((sum, [id, qty]) => {
      const ticket = ticketTypes.value.find((t) => t.id === Number(id))
      return sum + (ticket ? ticket.price * qty : 0)
    }, 0)
  })

  // Общее количество билетов
  const totalTicketsCount = computed(() => {
    return Object.values(selectedTickets.value).reduce((sum, qty) => sum + qty, 0)
  })

  // Валидность формы
  const isFormValid = computed(() => {
    return selectedDate.value && selectedTime.value && totalTicketsCount.value > 0
  })

  // Активные бронирования (оплаченные и ожидающие)
  const activeBookings = computed(() => {
    return bookings.value.filter((b) => b.status === 'paid' || b.status === 'pending')
  })

  // Отменённые бронирования
  const cancelledBookings = computed(() => {
    return bookings.value.filter((b) => b.status === 'cancelled')
  })

  // Доступные типы билетов
  const availableTicketTypes = computed(() => {
    return ticketTypes.value.filter((t) => t.isActive !== false)
  })

  // Доступные временные слоты
  const availableTimeSlots = computed(() => {
    return timeSlots.value.filter((s) => s.available)
  })

  // Ближайшее бронирование
  const upcomingBooking = computed(() => {
    const now = new Date()
    return activeBookings.value
      .filter((b) => new Date(b.visitDate) >= now)
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())[0]
  })

  // ==================== ACTIONS ====================

  // Получить типы билетов
  async function fetchTicketTypes() {
    isLoading.value = true
    error.value = null

    try {
      ticketTypes.value = await ticketsService.getTypes()
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ошибка загрузки типов билетов'
      error.value = message
      ElMessage.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Получить расписание работы
  async function fetchSchedule() {
    isLoading.value = true
    error.value = null

    try {
      const schedule = await ticketsService.getSchedule()
      return schedule
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ошибка загрузки расписания'
      error.value = message
      ElMessage.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Получить временные слоты на дату
  async function fetchTimeSlots(date: string) {
    isLoading.value = true
    error.value = null
    selectedDate.value = date

    try {
      timeSlots.value = await ticketsService.getTimeSlots(date)
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ошибка загрузки времени'
      error.value = message
      ElMessage.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Получить мои бронирования (для профиля)
  async function fetchMyBookings() {
    isLoading.value = true
    error.value = null

    try {
      bookings.value = await profileService.getPurchases()
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ошибка загрузки бронирований'
      error.value = message
      ElMessage.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Выбрать время
  function selectTime(time: string) {
    selectedTime.value = time
  }

  // Обновить количество билетов
  function updateTicketQuantity(ticketTypeId: number, quantity: number) {
    if (quantity < 0) quantity = 0

    // Проверяем ограничение по количеству
    const ticket = ticketTypes.value.find((t) => t.id === ticketTypeId)
    if (ticket?.maxQuantity && quantity > ticket.maxQuantity) {
      quantity = ticket.maxQuantity
      ElMessage.warning(`Максимум ${ticket.maxQuantity} билетов этого типа`)
    }

    selectedTickets.value[ticketTypeId] = quantity
  }

  // Создать бронирование
  async function createBooking(bookingData?: {
    visitDate: string
    visitTime: string
    tickets: Array<{
      ticketTypeId: number
      quantity: number
      price: number
    }>
  }) {
    isLoading.value = true
    error.value = null

    try {
      // Если переданы данные — используем их
      let tickets: Array<{ ticketTypeId: number; quantity: number; price: number }>
      let finalDate: string
      let finalTime: string

      if (bookingData) {
        // ✅ Используем переданные данные
        tickets = bookingData.tickets
        finalDate = bookingData.visitDate
        finalTime = bookingData.visitTime
      } else {
        // Fallback: используем state
        if (!isFormValid.value) {
          ElMessage.warning('Заполните все поля')
          return null
        }

        tickets = Object.entries(selectedTickets.value)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => {
            const ticket = ticketTypes.value.find((t) => t.id === Number(id))!
            return {
              ticketTypeId: ticket.id,
              quantity: qty,
              price: ticket.price,
            }
          })

        if (tickets.length === 0) {
          ElMessage.warning('Выберите хотя бы один билет')
          return null
        }

        finalDate = selectedDate.value
        finalTime = selectedTime.value
      }

      const requestData: BookingRequest = {
        visitDate: finalDate,
        visitTime: finalTime,
        tickets,
      }

      console.log('📡 Store: создание бронирования', requestData)

      currentBooking.value = await ticketsService.book(requestData)

      console.log('✅ Store: бронирование создано', currentBooking.value)

      ElMessage.success('Бронирование создано!')

      // Обновляем список бронирований
      await fetchMyBookings()

      // Сбрасываем форму только если использовали state
      if (!bookingData) {
        resetForm()
      }

      return currentBooking.value
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ошибка бронирования'
      error.value = message
      console.error('❌ Store: ошибка бронирования', err)
      ElMessage.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Подтвердить оплату
  async function confirmPayment(bookingId: number, paymentId: string) {
    isLoading.value = true

    try {
      await ticketsService.confirmPayment(bookingId, paymentId)
      ElMessage.success('Оплата подтверждена')

      // Обновляем список
      await fetchMyBookings()
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ошибка подтверждения оплаты'
      ElMessage.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Отменить бронирование
  async function cancelBooking(bookingId: number) {
    isLoading.value = true

    try {
      await ticketsService.cancelBooking(bookingId)
      ElMessage.success('Бронирование отменено')

      // Обновляем список
      await fetchMyBookings()
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ошибка отмены'
      ElMessage.error(message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Сброс формы
  function resetForm() {
    selectedDate.value = ''
    selectedTime.value = ''
    selectedTickets.value = {}
    timeSlots.value = []
    error.value = null
  }

  // Очистить текущее бронирование
  function clearCurrentBooking() {
    currentBooking.value = null
  }

  // Получить бронирование по ID
  function getBookingById(id: number) {
    return bookings.value.find((b) => b.id === id)
  }

  return {
    // State
    ticketTypes,
    timeSlots,
    bookings,
    currentBooking,
    selectedDate,
    selectedTime,
    selectedTickets,
    isLoading,
    error,

    // Computed
    totalPrice,
    totalTicketsCount,
    isFormValid,
    activeBookings,
    cancelledBookings,
    availableTicketTypes,
    availableTimeSlots,
    upcomingBooking,

    // Actions
    fetchTicketTypes,
    fetchSchedule,
    fetchTimeSlots,
    fetchMyBookings,
    selectTime,
    updateTicketQuantity,
    createBooking,
    confirmPayment,
    cancelBooking,
    resetForm,
    clearCurrentBooking,
    getBookingById,
  }
})
