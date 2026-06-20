<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { usersService, type AdminUser } from '@/services/users.service'

// Данные
const users = ref<AdminUser[]>([])
const isLoading = ref(true)
const loadError = ref('')

// Поиск
const searchQuery = ref('')

// Фильтр по роли
const roleFilter = ref<'all' | 'admin' | 'moderator' | 'user'>('all')

// Модальное окно
const showUserModal = ref(false)
const editingUser = ref<AdminUser | null>(null)
const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'user' as 'admin' | 'moderator' | 'user',
  status: 'active' as 'active' | 'blocked' | 'pending',
})

// Статистика (с безопасными проверками)
const stats = computed(() => {
  const list = users.value || []
  return {
    total: list.length,
    active: list.filter((u) => u.status === 'active').length,
    blocked: list.filter((u) => u.status === 'blocked').length,
    pending: list.filter((u) => u.status === 'pending').length,
  }
})

// Фильтрация (с безопасной проверкой)
const filteredUsers = computed(() => {
  const list = users.value || []
  return list.filter((user) => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch =
      !query ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)

    const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value

    return matchesSearch && matchesRole
  })
})

// Конфигурация статуса
// Конфигурация статуса
const getStatusConfig = (status: AdminUser['status']) => {
  const configs = {
    active: {
      label: 'Активен',
      badge: 'bg-lime/15 text-lime border-lime/30',
      dot: 'bg-lime shadow-[0_0_8px_rgba(168,201,107,0.6)]',
      avatar: 'bg-lime/20 text-lime',
      icon: 'fa-solid fa-circle-check',
    },
    blocked: {
      label: 'Заблокирован',
      badge: 'bg-terracotta/15 text-terracotta border-terracotta/30',
      dot: 'bg-terracotta shadow-[0_0_8px_rgba(196,96,42,0.6)]',
      avatar: 'bg-terracotta/20 text-terracotta',
      icon: 'fa-solid fa-ban',
    },
    pending: {
      label: 'Ожидает',
      badge: 'bg-amber/15 text-amber border-amber/30',
      dot: 'bg-amber shadow-[0_0_8px_rgba(232,147,58,0.6)]',
      avatar: 'bg-amber/20 text-amber',
      icon: 'fa-solid fa-hourglass-half',
    },
  }
  
  // Возвращаем дефолтную конфигурацию если статус не найден
  return configs[status] || configs.active
}

// Конфигурация роли
// Конфигурация роли
const getRoleConfig = (role?: AdminUser['role']) => {
  const configs = {
    admin: {
      label: 'Администратор',
      class: 'bg-terracotta/15 text-terracotta border-terracotta/30',
      icon: 'fa-solid fa-crown',
    },
    moderator: {
      label: 'Модератор',
      class: 'bg-amber/15 text-amber border-amber/30',
      icon: 'fa-solid fa-shield-halved',
    },
    user: {
      label: 'Посетитель',
      class: 'bg-sage/15 text-sage border-sage/30',
      icon: 'fa-solid fa-user',
    },
  }
  
  // Возвращаем дефолтную конфигурацию если роль undefined или невалидная
  if (!role || !configs[role]) {
    return configs.user
  }
  
  return configs[role]
}

// Форматирование даты
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ==================== ЗАГРУЗКА ДАННЫХ ====================

const loadUsers = async () => {
  isLoading.value = true
  loadError.value = ''
  
  try {
    const response = await usersService.getAll()
    
    console.log('📦 Service response:', response)
    console.log('📦 Type:', typeof response)
    console.log('📦 Is array?', Array.isArray(response))
    
    // Обработка разных форматов ответа
    if (Array.isArray(response)) {
      users.value = response
    } else if (response && response.users) {
      users.value = response.users
    } else {
      users.value = []
    }
    
    console.log('✅ Users loaded:', users.value.length)
  } catch (error: any) {
    console.error('❌ Error loading users:', error)
    loadError.value = error.response?.data?.error || 'Не удалось загрузить пользователей'
    ElMessage.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

// ==================== CRUD ОПЕРАЦИИ ====================

const openCreateModal = () => {
  editingUser.value = null
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active',
  }
  showUserModal.value = true
}

const openEditModal = (user: AdminUser) => {
  editingUser.value = user
  userForm.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
  }
  showUserModal.value = true
}

const saveUser = async () => {
  if (!userForm.value.firstName || !userForm.value.email) {
    ElMessage.error('Заполните обязательные поля')
    return
  }

  try {
    if (editingUser.value) {
      await usersService.update(editingUser.value.id, {
        firstName: userForm.value.firstName,
        lastName: userForm.value.lastName,
        email: userForm.value.email,
        role: userForm.value.role,
      })
      ElMessage.success('Пользователь обновлён')
    } else {
      const result = await usersService.create({
        firstName: userForm.value.firstName,
        lastName: userForm.value.lastName,
        email: userForm.value.email,
        role: userForm.value.role,
      })
      
      if (result.tempPassword) {
        ElMessageBox.alert(
          `Временный пароль: <strong>${result.tempPassword}</strong><br/><br/>Сообщите его пользователю!`,
          'Пользователь создан',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: 'Скопировать',
            callback: () => {
              navigator.clipboard.writeText(result.tempPassword!)
              ElMessage.success('Пароль скопирован')
            }
          }
        )
      } else {
        ElMessage.success('Пользователь создан')
      }
    }

    showUserModal.value = false
    await loadUsers()
  } catch (error: any) {
    console.error('Save error:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  }
}

const deleteUser = async (user: AdminUser) => {
  try {
    await ElMessageBox.confirm(
      `Удалить пользователя ${user.firstName} ${user.lastName}?`,
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
        confirmButtonClass: 'bg-terracotta hover:bg-terracotta/90',
      }
    )

    await usersService.delete(user.id)
    ElMessage.success('Пользователь удалён')
    await loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  }
}

const closeModal = () => {
  showUserModal.value = false
  editingUser.value = null
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Статистика -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      <div class="group relative overflow-hidden rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/40 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-sage/40">
        <i class="fa-solid fa-users absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20 text-sage"></i>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <i class="fa-solid fa-users text-sage"></i>
          Всего
        </div>
        <div class="relative mt-2 text-2xl font-bold text-cream-100 sm:text-3xl">{{ stats.total }}</div>
      </div>

      <div class="group relative overflow-hidden rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/10 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-lime/40">
        <i class="fa-solid fa-circle-check absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20 text-lime"></i>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <i class="fa-solid fa-circle-check text-lime"></i>
          Активных
        </div>
        <div class="relative mt-2 text-2xl font-bold text-lime sm:text-3xl">{{ stats.active }}</div>
      </div>

      <div class="group relative overflow-hidden rounded-2xl border border-terracotta/20 bg-gradient-to-br from-terracotta/10 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-terracotta/40">
        <i class="fa-solid fa-ban absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20 text-terracotta"></i>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <i class="fa-solid fa-ban text-terracotta"></i>
          Заблокировано
        </div>
        <div class="relative mt-2 text-2xl font-bold text-terracotta sm:text-3xl">{{ stats.blocked }}</div>
      </div>

      <div class="group relative overflow-hidden rounded-2xl border border-amber/20 bg-gradient-to-br from-amber/10 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-amber/40">
        <i class="fa-solid fa-hourglass-half absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20 text-amber"></i>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <i class="fa-solid fa-hourglass-half text-amber"></i>
          Ожидают
        </div>
        <div class="relative mt-2 text-2xl font-bold text-amber sm:text-3xl">{{ stats.pending }}</div>
      </div>
    </div>

    <!-- Панель управления -->
    <div class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 backdrop-blur-sm sm:p-6">
      <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div class="w-full sm:max-w-xs">
          <BaseInput v-model="searchQuery" placeholder="Поиск по имени или email..." />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              v-for="role in [
                { value: 'all', label: 'Все', icon: 'fa-solid fa-users' },
                { value: 'admin', label: 'Админ', icon: 'fa-solid fa-crown' },
                { value: 'moderator', label: 'Модератор', icon: 'fa-solid fa-shield-halved' },
                { value: 'user', label: 'Посетитель', icon: 'fa-solid fa-user' },
              ]"
              :key="role.value"
              class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm"
              :class="roleFilter === role.value
                ? 'border-lime/40 bg-lime/20 text-lime shadow-[0_0_12px_rgba(168,201,107,0.2)]'
                : 'border-sage/20 bg-forest-400/40 text-cream-100/70 hover:border-sage/40 hover:bg-forest-300/40 hover:text-cream-100'"
              @click="roleFilter = role.value as any"
            >
              <i :class="role.icon" class="text-xs"></i>
              {{ role.label }}
            </button>
          </div>

          <button
            class="group mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime shadow-[0_0_16px_rgba(168,201,107,0.15)] transition hover:from-lime/30 hover:to-sage/30 hover:shadow-[0_0_24px_rgba(168,201,107,0.3)] sm:mt-0 sm:w-auto"
            @click="openCreateModal"
          >
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-lime/30 text-base leading-none transition group-hover:rotate-90">
              <i class="fa-solid fa-plus text-xs"></i>
            </span>
            Добавить
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="py-12 text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent"></i>
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="py-12 text-center">
        <i class="fa-solid fa-triangle-exclamation text-5xl text-terracotta"></i>
        <div class="mt-2 text-cream-100/70">{{ loadError }}</div>
        <button @click="loadUsers" class="mt-4 rounded-full bg-accent px-6 py-2 text-forest-900 font-medium">
          <i class="fa-solid fa-rotate-right mr-2"></i>
          Повторить
        </button>
      </div>

      <!-- Таблица -->
      <div v-else>
        <!-- Мобильный вид -->
        <div class="space-y-3 md:hidden">
          <div v-for="user in filteredUsers" :key="user.id" class="rounded-xl border border-sage/15 bg-forest-400/40 p-4 transition hover:border-sage/30">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold" :class="getStatusConfig(user.status).avatar">
  {{ (user.firstName || user.email || 'U').charAt(0).toUpperCase() }}
</div>
                <div>
                  <div class="font-semibold text-cream-100">{{ user.firstName }} {{ user.lastName }}</div>
                  <div class="text-xs text-cream-100/50">{{ user.email }}</div>
                </div>
              </div>
              <span class="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium" :class="getStatusConfig(user.status).badge">
                {{ getStatusConfig(user.status).label }}
              </span>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-sage/10 pt-3 text-xs">
              <span class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5" :class="getRoleConfig(user.role).class">
                <i :class="getRoleConfig(user.role).icon" class="text-xs"></i>
                {{ getRoleConfig(user.role).label }}
              </span>
              <span class="text-cream-100/40">•</span>
              <span class="text-cream-100/60">ID: {{ user.id }}</span>
            </div>

            <div class="mt-3 flex gap-2 border-t border-sage/10 pt-3">
              <button class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sage/20 bg-forest-300/40 py-2 text-xs font-medium text-cream-100/80 transition hover:border-lime/30 hover:bg-lime/10 hover:text-lime" @click="openEditModal(user)">
                <i class="fa-solid fa-pen text-xs"></i>
                Изменить
              </button>
              <button class="flex items-center justify-center gap-1.5 rounded-lg border border-terracotta/20 bg-terracotta/5 px-3 py-2 text-xs font-medium text-terracotta transition hover:bg-terracotta/15" @click="deleteUser(user)">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </div>

          <div v-if="filteredUsers.length === 0" class="rounded-xl border border-sage/10 bg-forest-400/20 py-12 text-center">
            <i class="fa-solid fa-inbox text-5xl text-cream-100/30 mb-3"></i>
            <div class="font-medium text-cream-100/70">
              {{ searchQuery || roleFilter !== 'all' ? 'Никого не нашли' : 'Пока пусто' }}
            </div>
          </div>
        </div>

        <!-- Десктопный вид -->
        <div class="hidden overflow-hidden rounded-xl border border-sage/15 md:block">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-sage/20 bg-forest-400/40">
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">Пользователь</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">Email</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">Роль</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">Статус</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">Регистрация</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-cream-100/60">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id" class="border-b border-sage/10 transition hover:bg-forest-300/30">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" :class="getStatusConfig(user.status).avatar">
                        {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                      </div>
                      <div>
                        <div class="font-medium text-cream-100">{{ user.firstName }} {{ user.lastName }}</div>
                        <div class="text-xs text-cream-100/40">ID: {{ user.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-cream-100/70">{{ user.email }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium" :class="getRoleConfig(user.role).class">
                      <i :class="getRoleConfig(user.role).icon" class="text-xs"></i>
                      {{ getRoleConfig(user.role).label }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full" :class="getStatusConfig(user.status).dot" />
                      <span class="text-sm text-cream-100/70">{{ getStatusConfig(user.status).label }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-cream-100/60">{{ formatDate(user.registeredAt) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <button class="rounded-lg p-2 text-cream-100/60 transition hover:bg-lime/10 hover:text-lime" title="Редактировать" @click="openEditModal(user)">
                        <i class="fa-solid fa-pen"></i>
                      </button>
                      <button class="rounded-lg p-2 text-cream-100/60 transition hover:bg-terracotta/15 hover:text-terracotta" title="Удалить" @click="deleteUser(user)">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredUsers.length === 0" class="border-t border-sage/10 bg-forest-400/20 py-16 text-center">
            <i class="fa-solid fa-inbox text-6xl text-cream-100/20 mb-3"></i>
            <div class="font-medium text-cream-100/70">
              {{ searchQuery || roleFilter !== 'all' ? 'Никого не нашли' : 'Пока пусто' }}
            </div>
          </div>
        </div>

        <div v-if="filteredUsers.length > 0" class="mt-4 flex items-center justify-between border-t border-sage/15 pt-4 text-xs text-cream-100/50 sm:text-sm">
          <span>Показано: {{ filteredUsers.length }} из {{ users.length }}</span>
        </div>
      </div>
    </div>

    <!-- Модальное окно -->
    <Transition name="modal-backdrop">
      <div v-if="showUserModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-4" @click="closeModal">
        <div @click.stop class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-6">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-lime/20 text-lime">
              <i :class="editingUser ? 'fa-solid fa-pen' : 'fa-solid fa-user-plus'" class="text-lg"></i>
            </div>
            <h3 class="text-lg font-bold text-cream-100 sm:text-xl">
              {{ editingUser ? 'Редактировать' : 'Новый пользователь' }}
            </h3>
          </div>

          <div class="space-y-4">
            <BaseInput v-model="userForm.firstName" label="Имя" placeholder="Введите имя" />
            <BaseInput v-model="userForm.lastName" label="Фамилия" placeholder="Введите фамилию" />
            <BaseInput v-model="userForm.email" label="Email" type="email" placeholder="example@mail.com" />

            <div>
              <label class="label py-2">
                <span class="label-text text-sm font-medium text-cream-100/80">
                  <i class="fa-solid fa-user-tag mr-1"></i>
                  Роль
                </span>
              </label>
              <select v-model="userForm.role" class="select select-bordered w-full border-sage/20 bg-forest-400/60 text-cream-100 focus:border-lime/50">
                <option value="user">Посетитель</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <div v-if="editingUser">
              <label class="label py-2">
                <span class="label-text text-sm font-medium text-cream-100/80">
                  <i class="fa-solid fa-circle-info mr-1"></i>
                  Статус
                </span>
              </label>
              <select v-model="userForm.status" class="select select-bordered w-full border-sage/20 bg-forest-400/60 text-cream-100 focus:border-lime/50">
                <option value="active">Активен</option>
                <option value="pending">Ожидает подтверждения</option>
                <option value="blocked">Заблокирован</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button class="w-full rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2.5 text-sm font-medium text-cream-100/80 transition hover:bg-forest-300/50 sm:w-auto" @click="closeModal">
              Отмена
            </button>
            <button class="w-full rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2.5 text-sm font-semibold text-lime shadow-[0_0_16px_rgba(168,201,107,0.2)] transition hover:shadow-[0_0_24px_rgba(168,201,107,0.35)] sm:w-auto" @click="saveUser">
              <i :class="editingUser ? 'fa-solid fa-floppy-disk' : 'fa-solid fa-plus'" class="mr-1"></i>
              {{ editingUser ? 'Сохранить' : 'Создать' }}
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