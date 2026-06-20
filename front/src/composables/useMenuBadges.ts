import { ref, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { promocodesService } from '@/services/promocodes.service'
import { adminPromocodesService } from '@/services/adminPromocodes.service'

interface MenuBadges {
  promocodes?: number
  notifications?: number
  'admin-users'?: number
  'admin-promocodes'?: number
}

export function useMenuBadges() {
  const authStore = useAuthStore()
  const badges = ref<MenuBadges>({})
  const isLoading = ref(false)

  const fetchBadges = async () => {
    if (!authStore.isAuthenticated) {
      badges.value = {}
      return
    }

    isLoading.value = true

    try {
      const isAdmin = authStore.isAdmin

      // Параллельная загрузка для производительности
      const promises: Promise<void>[] = []

      // Промокоды пользователя
      if (!isAdmin) {
        promises.push(
          (async () => {
            try {
              const response = await promocodesService.getMy()
              const activePromocodes = response.promocodes.filter((p) => p.status === 'active')
              badges.value.promocodes = activePromocodes.length
            } catch (error) {
              console.error('Error fetching promocodes count:', error)
              badges.value.promocodes = 0
            }
          })()
        )
      }

      // Уведомления (заглушка, замените на реальный API)
      promises.push(
        (async () => {
          try {
            // TODO: Замените на реальный API уведомлений
            // const response = await notificationsService.getUnreadCount()
            // badges.value.notifications = response.count
            badges.value.notifications = 0
          } catch (error) {
            console.error('Error fetching notifications count:', error)
            badges.value.notifications = 0
          }
        })()
      )

      // Админские бейджи
      if (isAdmin) {
        // Количество пользователей
        promises.push(
          (async () => {
            try {
              // TODO: Создайте endpoint GET /admin/users/stats
              // const response = await adminService.getUsersStats()
              // badges.value['admin-users'] = response.total

              // Временная заглушка - получите из API
              const response = await fetch('/admin/users', {
                headers: {
                  Authorization: `Bearer ${authStore.token}`,
                },
              })
              if (response.ok) {
                const data = await response.json()
                badges.value['admin-users'] = data.total || 0
              }
            } catch (error) {
              console.error('Error fetching users count:', error)
              badges.value['admin-users'] = 0
            }
          })()
        )

        // Промокоды (админ)
        promises.push(
          (async () => {
            try {
              const stats = await adminPromocodesService.getStats()
              badges.value['admin-promocodes'] = stats.total
            } catch (error) {
              console.error('Error fetching admin promocodes count:', error)
              badges.value['admin-promocodes'] = 0
            }
          })()
        )
      }

      await Promise.all(promises)
    } finally {
      isLoading.value = false
    }
  }

  // Автозагрузка при изменении авторизации
  watchEffect(() => {
    if (authStore.isAuthenticated) {
      fetchBadges()
    }
  })

  return {
    badges,
    isLoading,
    fetchBadges,
  }
}
