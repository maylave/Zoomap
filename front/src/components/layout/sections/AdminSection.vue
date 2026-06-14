<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'

// Типы
interface AdminUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  status: 'active' | 'blocked' | 'pending'
  registeredAt: string
  lastLogin: string
}

type UserForm = {
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  status: 'active' | 'blocked' | 'pending'
}

// Данные
const users = ref<AdminUser[]>([
  {
    id: 1,
    firstName: 'Мария',
    lastName: 'Иванова',
    email: 'maria@example.com',
    role: 'admin',
    status: 'active',
    registeredAt: '2024-01-15',
    lastLogin: '2 часа назад',
  },
  {
    id: 2,
    firstName: 'Алексей',
    lastName: 'Петров',
    email: 'alexey@example.com',
    role: 'moderator',
    status: 'active',
    registeredAt: '2024-02-20',
    lastLogin: 'Вчера',
  },
  {
    id: 3,
    firstName: 'Елена',
    lastName: 'Сидорова',
    email: 'elena@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2024-03-10',
    lastLogin: '3 дня назад',
  },
  {
    id: 4,
    firstName: 'Дмитрий',
    lastName: 'Козлов',
    email: 'dmitry@example.com',
    role: 'user',
    status: 'blocked',
    registeredAt: '2024-01-05',
    lastLogin: 'Неделю назад',
  },
  {
    id: 5,
    firstName: 'Ольга',
    lastName: 'Новикова',
    email: 'olga@example.com',
    role: 'user',
    status: 'pending',
    registeredAt: '2024-04-01',
    lastLogin: 'Никогда',
  },
])

// Поиск
const searchQuery = ref('')

// Фильтр по роли
const roleFilter = ref<'all' | 'admin' | 'moderator' | 'user'>('all')

// Модальное окно
const showUserModal = ref(false)
const editingUser = ref<AdminUser | null>(null)
const userForm = ref<UserForm>({
  firstName: '',
  lastName: '',
  email: '',
  role: 'user',
  status: 'active',
})

// Статистика
const stats = computed(() => ({
  total: users.value.length,
  active: users.value.filter((u) => u.status === 'active').length,
  blocked: users.value.filter((u) => u.status === 'blocked').length,
  pending: users.value.filter((u) => u.status === 'pending').length,
}))

// Фильтрация
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
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

// 🎨 Конфигурация статуса — цвета зоопарка
const getStatusConfig = (status: AdminUser['status']) => {
  const configs = {
    active: {
      label: 'Активен',
      badge: 'bg-lime/15 text-lime border-lime/30',
      dot: 'bg-lime shadow-[0_0_8px_rgba(168,201,107,0.6)]',
      avatar: 'bg-lime/20 text-lime',
    },
    blocked: {
      label: 'Заблокирован',
      badge: 'bg-terracotta/15 text-terracotta border-terracotta/30',
      dot: 'bg-terracotta shadow-[0_0_8px_rgba(196,96,42,0.6)]',
      avatar: 'bg-terracotta/20 text-terracotta',
    },
    pending: {
      label: 'Ожидает',
      badge: 'bg-amber/15 text-amber border-amber/30',
      dot: 'bg-amber shadow-[0_0_8px_rgba(232,147,58,0.6)]',
      avatar: 'bg-amber/20 text-amber',
    },
  }
  return configs[status]
}

// 🎨 Конфигурация роли — цвета зоопарка
const getRoleConfig = (role: AdminUser['role']) => {
  const configs = {
    admin: {
      label: 'Администратор',
      class: 'bg-terracotta/15 text-terracotta border-terracotta/30',
      icon: '🦁',
    },
    moderator: {
      label: 'Модератор',
      class: 'bg-amber/15 text-amber border-amber/30',
      icon: '🦊',
    },
    user: {
      label: 'Посетитель',
      class: 'bg-sage/15 text-sage border-sage/30',
      icon: '🐾',
    },
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

// Открыть модалку для создания
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

// Открыть модалку для редактирования
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

// Сохранить пользователя
const saveUser = () => {
  if (!userForm.value.firstName || !userForm.value.lastName || !userForm.value.email) {
    return
  }

  if (editingUser.value) {
    const index = users.value.findIndex((u) => u.id === editingUser.value!.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        ...userForm.value,
      }
    }
  } else {
    const newUser: AdminUser = {
      id: Math.max(...users.value.map((u) => u.id), 0) + 1,
      ...userForm.value,
      registeredAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Никогда',
    }
    users.value.push(newUser)
  }
  showUserModal.value = false
}

// Удалить пользователя
const deleteUser = (user: AdminUser) => {
  if (confirm(`Удалить пользователя ${user.firstName} ${user.lastName}?`)) {
    users.value = users.value.filter((u) => u.id !== user.id)
  }
}

// Закрыть модалку
const closeModal = () => {
  showUserModal.value = false
  editingUser.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- 📊 Статистика — цвета зоопарка -->
    <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      <!-- Всего -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/40 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-sage/40"
      >
        <div class="absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20">
          🌿
        </div>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <BaseIcon name="user" size="sm" class="text-sage" />
          Всего
        </div>
        <div class="relative mt-2 text-2xl font-bold text-cream-100 sm:text-3xl">
          {{ stats.total }}
        </div>
      </div>

      <!-- Активных -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/10 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-lime/40"
      >
        <div class="absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20">
          🦜
        </div>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <BaseIcon name="shield" size="sm" class="text-lime" />
          Активных
        </div>
        <div class="relative mt-2 text-2xl font-bold text-lime sm:text-3xl">
          {{ stats.active }}
        </div>
      </div>

      <!-- Заблокировано -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-terracotta/20 bg-gradient-to-br from-terracotta/10 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-terracotta/40"
      >
        <div class="absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20">
          🚫
        </div>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <BaseIcon name="key" size="sm" class="text-terracotta" />
          Заблокировано
        </div>
        <div class="relative mt-2 text-2xl font-bold text-terracotta sm:text-3xl">
          {{ stats.blocked }}
        </div>
      </div>

      <!-- Ожидают -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-amber/20 bg-gradient-to-br from-amber/10 to-forest-400/40 p-4 backdrop-blur-sm transition hover:border-amber/40"
      >
        <div class="absolute -top-4 -right-4 text-5xl opacity-10 transition group-hover:opacity-20">
          ⏳
        </div>
        <div class="relative flex items-center gap-2 text-xs font-medium text-cream-100/60 sm:text-sm">
          <BaseIcon name="bell" size="sm" class="text-amber" />
          Ожидают
        </div>
        <div class="relative mt-2 text-2xl font-bold text-amber sm:text-3xl">
          {{ stats.pending }}
        </div>
      </div>
    </div>

    <!-- 🎛️ Панель управления -->
    <div
      class="rounded-2xl border border-sage/20 bg-gradient-to-br from-forest-300/30 to-forest-400/30 p-4 backdrop-blur-sm sm:p-6"
    >
      <div class="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div class="w-full sm:max-w-xs">
          <BaseInput
            v-model="searchQuery"
            placeholder="🔍 Поиск по имени или email..."
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Фильтры ролей -->
          <div class="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              v-for="role in [
                { value: 'all', label: 'Все' },
                { value: 'admin', label: '🦁' },
                { value: 'moderator', label: '🦊' },
                { value: 'user', label: '🐾' },
              ]"
              :key="role.value"
              class="rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm"
              :class="
                roleFilter === role.value
                  ? 'border-lime/40 bg-lime/20 text-lime shadow-[0_0_12px_rgba(168,201,107,0.2)]'
                  : 'border-sage/20 bg-forest-400/40 text-cream-100/70 hover:border-sage/40 hover:bg-forest-300/40 hover:text-cream-100'
              "
              @click="roleFilter = role.value as any"
            >
              {{ role.label }}
            </button>
          </div>

          <!-- Кнопка добавить -->
          <button
            class="group mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2 text-sm font-semibold text-lime shadow-[0_0_16px_rgba(168,201,107,0.15)] transition hover:from-lime/30 hover:to-sage/30 hover:shadow-[0_0_24px_rgba(168,201,107,0.3)] sm:mt-0 sm:w-auto"
            @click="openCreateModal"
          >
            <span
              class="flex h-5 w-5 items-center justify-center rounded-full bg-lime/30 text-base leading-none transition group-hover:rotate-90"
            >
              +
            </span>
            Добавить
          </button>
        </div>
      </div>

      <!-- 📱 Карточный вид для мобильных -->
      <div class="space-y-3 md:hidden">
        <div
          v-for="user in filteredUsers"
          :key="user.id"
          class="rounded-xl border border-sage/15 bg-forest-400/40 p-4 transition hover:border-sage/30"
        >
          <!-- Шапка карточки -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold"
                :class="getStatusConfig(user.status).avatar"
              >
                {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
              </div>
              <div>
                <div class="font-semibold text-cream-100">
                  {{ user.firstName }} {{ user.lastName }}
                </div>
                <div class="text-xs text-cream-100/50">{{ user.email }}</div>
              </div>
            </div>
            <span
              class="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
              :class="getStatusConfig(user.status).badge"
            >
              {{ getStatusConfig(user.status).label }}
            </span>
          </div>

          <!-- Детали -->
          <div class="mt-3 flex flex-wrap items-center gap-2 border-t border-sage/10 pt-3 text-xs">
            <span
              class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
              :class="getRoleConfig(user.role).class"
            >
              <span>{{ getRoleConfig(user.role).icon }}</span>
              {{ getRoleConfig(user.role).label }}
            </span>
            <span class="text-cream-100/40">•</span>
            <span class="text-cream-100/60">ID: {{ user.id }}</span>
            <span class="text-cream-100/40">•</span>
            <span class="text-cream-100/60">{{ user.lastLogin }}</span>
          </div>

          <!-- Действия -->
          <div class="mt-3 flex gap-2 border-t border-sage/10 pt-3">
            <button
              class="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-sage/20 bg-forest-300/40 py-2 text-xs font-medium text-cream-100/80 transition hover:border-lime/30 hover:bg-lime/10 hover:text-lime"
              @click="openEditModal(user)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Изменить
            </button>
            <button
              class="flex items-center justify-center gap-1.5 rounded-lg border border-terracotta/20 bg-terracotta/5 px-3 py-2 text-xs font-medium text-terracotta transition hover:bg-terracotta/15"
              @click="deleteUser(user)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Пустое состояние (мобильное) -->
        <div
          v-if="filteredUsers.length === 0"
          class="rounded-xl border border-sage/10 bg-forest-400/20 py-12 text-center"
        >
          <div class="mb-3 text-5xl">🦉</div>
          <div class="font-medium text-cream-100/70">
            {{ searchQuery || roleFilter !== 'all' ? 'Никого не нашли' : 'Пока пусто' }}
          </div>
          <p class="mt-1 text-sm text-cream-100/40">
            {{ searchQuery || roleFilter !== 'all' ? 'Попробуйте другие фильтры' : 'Добавьте первого пользователя' }}
          </p>
        </div>
      </div>

      <!-- 🖥️ Табличный вид для десктопа -->
      <div class="hidden overflow-hidden rounded-xl border border-sage/15 md:block">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-sage/20 bg-forest-400/40">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">
                  Пользователь
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">
                  Email
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">
                  Роль
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">
                  Статус
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">
                  Регистрация
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cream-100/60">
                  Последний вход
                </th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-cream-100/60">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="border-b border-sage/10 transition hover:bg-forest-300/30"
              >
                <!-- Пользователь -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      :class="getStatusConfig(user.status).avatar"
                    >
                      {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
                    </div>
                    <div>
                      <div class="font-medium text-cream-100">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-xs text-cream-100/40">ID: {{ user.id }}</div>
                    </div>
                  </div>
                </td>

                <!-- Email -->
                <td class="px-4 py-3 text-sm text-cream-100/70">{{ user.email }}</td>

                <!-- Роль -->
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                    :class="getRoleConfig(user.role).class"
                  >
                    <span>{{ getRoleConfig(user.role).icon }}</span>
                    {{ getRoleConfig(user.role).label }}
                  </span>
                </td>

                <!-- Статус -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span class="h-2 w-2 rounded-full" :class="getStatusConfig(user.status).dot" />
                    <span class="text-sm text-cream-100/70">{{ getStatusConfig(user.status).label }}</span>
                  </div>
                </td>

                <!-- Регистрация -->
                <td class="px-4 py-3 text-sm text-cream-100/60">{{ formatDate(user.registeredAt) }}</td>

                <!-- Последний вход -->
                <td class="px-4 py-3 text-sm text-cream-100/60">{{ user.lastLogin }}</td>

                <!-- Действия -->
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <button
                      class="rounded-lg p-2 text-cream-100/60 transition hover:bg-lime/10 hover:text-lime"
                      title="Редактировать"
                      @click="openEditModal(user)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      class="rounded-lg p-2 text-cream-100/60 transition hover:bg-terracotta/15 hover:text-terracotta"
                      title="Удалить"
                      @click="deleteUser(user)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пустое состояние (десктоп) -->
        <div
          v-if="filteredUsers.length === 0"
          class="border-t border-sage/10 bg-forest-400/20 py-16 text-center"
        >
          <div class="mb-3 text-6xl">🦉</div>
          <div class="font-medium text-cream-100/70">
            {{ searchQuery || roleFilter !== 'all' ? 'Никого не нашли' : 'Пока пусто' }}
          </div>
          <p class="mt-1 text-sm text-cream-100/40">
            {{ searchQuery || roleFilter !== 'all' ? 'Попробуйте другие фильтры' : 'Добавьте первого пользователя' }}
          </p>
        </div>
      </div>

      <!-- Итого -->
      <div
        v-if="filteredUsers.length > 0"
        class="mt-4 flex items-center justify-between border-t border-sage/15 pt-4 text-xs text-cream-100/50 sm:text-sm"
      >
        <span>Показано: {{ filteredUsers.length }} из {{ users.length }}</span>
      </div>
    </div>

    <!-- 💬 Модальное окно создания/редактирования -->
    <Transition name="modal-backdrop">
      <div
        v-if="showUserModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-4"
        @click="closeModal"
      >
        <div
          @click.stop
          class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-sage/30 bg-gradient-to-br from-forest-300 to-forest-400 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-6"
        >
          <!-- Заголовок -->
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-lime/20 text-xl">
              {{ editingUser ? '✏️' : '🐣' }}
            </div>
            <h3 class="text-lg font-bold text-cream-100 sm:text-xl">
              {{ editingUser ? 'Редактировать' : 'Новый пользователь' }}
            </h3>
          </div>

          <div class="space-y-4">
            <BaseInput
              v-model="userForm.firstName"
              label="Имя"
              placeholder="Введите имя"
            />
            <BaseInput
              v-model="userForm.lastName"
              label="Фамилия"
              placeholder="Введите фамилию"
            />
            <BaseInput
              v-model="userForm.email"
              label="Email"
              type="email"
              placeholder="example@mail.com"
            />

            <div>
              <label class="label py-2">
                <span class="label-text text-sm font-medium text-cream-100/80">🎭 Роль</span>
              </label>
              <select
                v-model="userForm.role"
                class="select select-bordered w-full border-sage/20 bg-forest-400/60 text-cream-100 focus:border-lime/50"
              >
                <option value="user">🐾 Посетитель</option>
                <option value="moderator">🦊 Модератор</option>
                <option value="admin">🦁 Администратор</option>
              </select>
            </div>

            <div>
              <label class="label py-2">
                <span class="label-text text-sm font-medium text-cream-100/80">📍 Статус</span>
              </label>
              <select
                v-model="userForm.status"
                class="select select-bordered w-full border-sage/20 bg-forest-400/60 text-cream-100 focus:border-lime/50"
              >
                <option value="active">✅ Активен</option>
                <option value="pending">⏳ Ожидает подтверждения</option>
                <option value="blocked">🚫 Заблокирован</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              class="w-full rounded-full border border-sage/20 bg-forest-400/40 px-4 py-2.5 text-sm font-medium text-cream-100/80 transition hover:bg-forest-300/50 sm:w-auto"
              @click="closeModal"
            >
              Отмена
            </button>
            <button
              class="w-full rounded-full border border-lime/30 bg-gradient-to-r from-lime/20 to-sage/20 px-4 py-2.5 text-sm font-semibold text-lime shadow-[0_0_16px_rgba(168,201,107,0.2)] transition hover:shadow-[0_0_24px_rgba(168,201,107,0.35)] sm:w-auto"
              @click="saveUser"
            >
              {{ editingUser ? '💾 Сохранить' : '✨ Создать' }}
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