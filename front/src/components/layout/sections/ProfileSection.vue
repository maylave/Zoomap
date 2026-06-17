<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { profileService } from '@/services/profile.service'

const authStore = useAuthStore()

// ==================== STATE ====================

// Режимы редактирования
const isEditing = ref(false)
const isChangingPassword = ref(false)
const isLoading = ref(false)
const isUploadingAvatar = ref(false)

// ✅ Ref для file input
const fileInputRef = ref<HTMLInputElement | null>(null)

// Локальная копия данных профиля
const localProfile = ref({
  firstName: authStore.user?.name?.split(' ')[0] || '',
  lastName: authStore.user?.name?.split(' ')[1] || '',
  email: authStore.user?.email || '',
  phone: '',
})

// ✅ Аватар - инициализируем из store или localStorage
const avatarUrl = ref<string | null>(
  authStore.user?.avatarUrl || localStorage.getItem('userAvatar') || null
)

// Смена пароля
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const originalProfile = ref({ ...localProfile.value })

// ==================== COMPUTED ====================

const initials = computed(() => {
  const first = localProfile.value.firstName.charAt(0)
  const last = localProfile.value.lastName.charAt(0)
  return `${first}${last}`.toUpperCase()
})

const hasChanges = computed(() => {
  return JSON.stringify(localProfile.value) !== JSON.stringify(originalProfile.value)
})

// ==================== LIFECYCLE ====================

onMounted(async () => {
  await loadProfile()
})

// ✅ Загрузка профиля с сервера
const loadProfile = async () => {
  try {
    const profile = await profileService.getProfile()
    
    // Обновляем локальные данные
    localProfile.value = {
      firstName: profile.name?.split(' ')[0] || '',
      lastName: profile.name?.split(' ')[1] || '',
      email: profile.email || '',
      phone: profile.phone || '',
    }
    
    originalProfile.value = { ...localProfile.value }
    
    // ✅ Если есть аватар - загружаем
    if (profile.avatarUrl) {
      avatarUrl.value = profile.avatarUrl
      localStorage.setItem('userAvatar', profile.avatarUrl)
    }
    
    // ✅ Обновляем store
    if (authStore.user) {
      authStore.user.name = profile.name
      authStore.user.email = profile.email
      if (profile.avatarUrl) {
        authStore.user.avatarUrl = profile.avatarUrl
      }
    }
  } catch (error: any) {
    console.error('Error loading profile:', error)
  }
}

// ==================== PROFILE EDITING ====================

const toggleEdit = async () => {
  if (isEditing.value) {
    await saveProfile()
  } else {
    isEditing.value = true
  }
}

const saveProfile = async () => {
  if (!hasChanges.value) {
    isEditing.value = false
    return
  }

  isLoading.value = true
  try {
    const fullName = `${localProfile.value.firstName} ${localProfile.value.lastName}`.trim()
    
    await profileService.updateProfile({
      name: fullName,
      email: localProfile.value.email,
      phone: localProfile.value.phone,
    })

    // Обновляем store
    if (authStore.user) {
      authStore.user.name = fullName
      authStore.user.email = localProfile.value.email
    }

    originalProfile.value = { ...localProfile.value }
    ElMessage.success('Профиль обновлён')
    isEditing.value = false
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка сохранения')
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  localProfile.value = { ...originalProfile.value }
  isEditing.value = false
}

// ==================== AVATAR ====================

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return

  // Проверка размера
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('Файл слишком большой (макс. 5MB)')
    return
  }

  // Проверка типа
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('Разрешены только JPG, PNG, WEBP')
    return
  }

  isUploadingAvatar.value = true
  
  try {
    const result = await profileService.uploadAvatar(file)
    avatarUrl.value = result.avatarUrl
    
    // ✅ Сохраняем в localStorage и store
    localStorage.setItem('userAvatar', result.avatarUrl)
    if (authStore.user) {
      authStore.user.avatarUrl = result.avatarUrl
    }
    
    ElMessage.success('Аватар загружен')
  } catch (error: any) {
    console.error('Upload error:', error)
    ElMessage.error(error.response?.data?.error || 'Ошибка загрузки')
  } finally {
    isUploadingAvatar.value = false
    // Очищаем input для возможности повторной загрузки того же файла
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const deleteAvatar = async () => {
  try {
    await ElMessageBox.confirm('Удалить аватар?', 'Подтверждение', {
      confirmButtonText: 'Удалить',
      cancelButtonText: 'Отмена',
      type: 'warning',
    })
    
    await profileService.deleteAvatar()
    avatarUrl.value = null
    
    // ✅ Очищаем localStorage и store
    localStorage.removeItem('userAvatar')
    if (authStore.user) {
      authStore.user.avatarUrl = null
    }
    
    ElMessage.success('Аватар удалён')
  } catch (error) {
    // Отменено
  }
}

// ==================== PASSWORD ====================

const openChangePassword = () => {
  isChangingPassword.value = true
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const changePassword = async () => {
  // Валидация
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.error('Заполните все поля')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.error('Пароль должен быть минимум 6 символов')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('Пароли не совпадают')
    return
  }

  isLoading.value = true
  try {
    await profileService.changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    })
    
    ElMessage.success('Пароль изменён')
    isChangingPassword.value = false
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || 'Ошибка смены пароля')
  } finally {
    isLoading.value = false
  }
}

// ==================== DELETE ACCOUNT ====================

const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!',
      'Удаление аккаунта',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'error',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700',
      }
    )

    await profileService.deleteAccount()
    ElMessage.success('Аккаунт удалён')
    await authStore.logout()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || 'Ошибка удаления')
    }
  }
}

// ==================== WATCHERS ====================

// Синхронизация с authStore
watch(() => authStore.user, (newUser) => {
  if (newUser && !isEditing.value) {
    localProfile.value = {
      firstName: newUser.name?.split(' ')[0] || '',
      lastName: newUser.name?.split(' ')[1] || '',
      email: newUser.email || '',
      phone: '',
    }
    originalProfile.value = { ...localProfile.value }
    
    // ✅ Обновляем аватар из store
    if (newUser.avatarUrl) {
      avatarUrl.value = newUser.avatarUrl
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <!-- ==================== ЛИЧНАЯ ИНФОРМАЦИЯ ==================== -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">Личная информация</h3>
        <div class="flex gap-2">
          <button
            v-if="isEditing"
            class="btn btn-outline btn-sm border-white/20 text-white hover:bg-white/10"
            @click="cancelEdit"
            :disabled="isLoading"
          >
            Отмена
          </button>
          <button
            class="btn btn-accent btn-sm"
            @click="toggleEdit"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Сохранение...
            </span>
            <span v-else>
              {{ isEditing ? 'Сохранить' : 'Редактировать' }}
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <BaseInput
          v-model="localProfile.firstName"
          label="Имя"
          placeholder="Введите имя"
          :readonly="!isEditing"
        />
        <BaseInput
          v-model="localProfile.lastName"
          label="Фамилия"
          placeholder="Введите фамилию"
          :readonly="!isEditing"
        />
        <BaseInput
          v-model="localProfile.email"
          label="Email"
          type="email"
          placeholder="example@mail.com"
          :readonly="!isEditing"
        />
        <BaseInput
          v-model="localProfile.phone"
          label="Телефон"
          type="tel"
          placeholder="+7 (___) ___-__-__"
          :readonly="!isEditing"
        />
      </div>
    </div>

    <!-- ==================== АВАТАР ==================== -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 class="mb-4 text-lg font-semibold text-white">Аватар</h3>
      <div class="flex items-center gap-4">
        <!-- Аватар / Инициалы -->
        <div class="bg-accent/20 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white overflow-hidden">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Avatar"
            class="w-full h-full object-cover"
          />
          <span v-else>{{ initials }}</span>
        </div>

        <!-- Кнопки управления -->
        <div class="flex flex-col gap-2">
          <!-- Скрытый input для выбора файла -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            class="hidden"
            @change="handleAvatarUpload"
            :disabled="isUploadingAvatar"
          />

          <!-- Кнопка загрузки -->
          <button
            @click="triggerFileInput"
            :disabled="isUploadingAvatar"
            class="btn btn-outline btn-sm border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isUploadingAvatar" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Загрузка...
            </span>
            <span v-else>Загрузить фото</span>
          </button>

          <!-- Кнопка удаления аватара -->
          <button
            v-if="avatarUrl"
            @click="deleteAvatar"
            :disabled="isUploadingAvatar"
            class="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            Удалить аватар
          </button>

          <p class="text-xs text-white/40">JPG, PNG до 5MB</p>
        </div>
      </div>
    </div>

    <!-- ==================== БЕЗОПАСНОСТЬ ==================== -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 class="mb-4 text-lg font-semibold text-white">Безопасность</h3>
      
      <!-- Форма смены пароля -->
      <div v-if="isChangingPassword" class="space-y-4 mb-4 p-4 bg-white/5 rounded-lg">
        <BaseInput
          v-model="passwordForm.oldPassword"
          label="Текущий пароль"
          type="password"
          placeholder="Введите текущий пароль"
        />
        <BaseInput
          v-model="passwordForm.newPassword"
          label="Новый пароль"
          type="password"
          placeholder="Минимум 6 символов"
        />
        <BaseInput
          v-model="passwordForm.confirmPassword"
          label="Подтвердите пароль"
          type="password"
          placeholder="Повторите новый пароль"
        />
        <div class="flex gap-2">
          <button
            @click="changePassword"
            :disabled="isLoading"
            class="btn btn-accent btn-sm"
          >
            <span v-if="isLoading">Сохранение...</span>
            <span v-else>Сохранить пароль</span>
          </button>
          <button
            @click="isChangingPassword = false"
            :disabled="isLoading"
            class="btn btn-outline btn-sm border-white/20 text-white hover:bg-white/10"
          >
            Отмена
          </button>
        </div>
      </div>

      <!-- Кнопки безопасности -->
      <div class="space-y-3">
        <button
          v-if="!isChangingPassword"
          @click="openChangePassword"
          class="btn btn-outline btn-sm border-white/20 text-white hover:bg-white/10 w-full"
        >
          Сменить пароль
        </button>
        <button
          @click="deleteAccount"
          class="btn btn-outline btn-sm border-red-500/30 text-red-400 hover:bg-red-500/10 w-full"
        >
          Удалить аккаунт
        </button>
      </div>
    </div>
  </div>
</template>