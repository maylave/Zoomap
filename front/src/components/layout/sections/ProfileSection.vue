<script setup lang="ts">
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  isEditing: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleEdit'): void
}>()

const initials = () => 
  `${props.profile.firstName.charAt(0)}${props.profile.lastName.charAt(0)}`.toUpperCase()
</script>

<template>
  <div class="space-y-6">
    <!-- Личная информация -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-white">Личная информация</h3>
        <button class="btn btn-accent btn-sm" @click="emit('toggleEdit')">
          {{ isEditing ? 'Сохранить' : 'Редактировать' }}
        </button>
      </div>

      <div class="space-y-4">
        <BaseInput
          v-model="profile.firstName"
          label="Имя"
          placeholder="Введите имя"
          :readonly="!isEditing"
        />
        <BaseInput
          v-model="profile.lastName"
          label="Фамилия"
          placeholder="Введите фамилию"
          :readonly="!isEditing"
        />
        <BaseInput
          v-model="profile.email"
          label="Email"
          type="email"
          placeholder="example@mail.com"
          :readonly="!isEditing"
        />
        <BaseInput
          v-model="profile.phone"
          label="Телефон"
          type="tel"
          placeholder="+7 (___) ___-__-__"
          :readonly="!isEditing"
        />
      </div>
    </div>

    <!-- Аватар -->
    <div class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 class="mb-4 text-lg font-semibold text-white">Аватар</h3>
      <div class="flex items-center gap-4">
        <div class="bg-accent/20 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white">
          {{ initials() }}
        </div>
        <div>
          <button class="btn btn-outline btn-sm border-white/20 text-white hover:bg-white/10">
            Загрузить фото
          </button>
          <p class="mt-2 text-xs text-white/40">JPG, PNG до 5MB</p>
        </div>
      </div>
    </div>
  </div>
</template>