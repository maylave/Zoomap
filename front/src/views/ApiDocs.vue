<template>
  <div class="min-h-screen bg-forest-400 px-6 py-24 lg:px-16">
    <div class="mx-auto max-w-7xl">
      <!-- Header -->
      <div class="mb-12 text-center">
        <span class="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          API Documentation
        </span>
        <h2 class="mt-6 text-4xl font-bold text-cream-100 md:text-5xl">
          API <span class="text-accent italic">Reference</span>
        </h2>
        <p class="mt-4 max-w-2xl mx-auto text-cream-100/60 text-lg">
          Полная документация по всем доступным endpoint'ам ZooVerse API
        </p>
      </div>

      <!-- Controls -->
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Search -->
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск endpoint'ов..."
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-cream-100 placeholder:text-cream-100/40 outline-none focus:border-accent/50 focus:bg-white/10 w-64"
          />
          
          <!-- Method Filter -->
          <select
            v-model="selectedMethod"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-cream-100 outline-none focus:border-accent/50"
          >
            <option value="">Все методы</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <!-- Sort By -->
          <select
            v-model="sortBy"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-cream-100 outline-none focus:border-accent/50"
          >
            <option value="path">По пути</option>
            <option value="method">По методу</option>
            <option value="description">По описанию</option>
            <option value="auth">По авторизации</option>
          </select>

          <!-- Sort Direction -->
          <button
            @click="toggleSortDirection"
            class="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-cream-100 transition-all hover:bg-white/10 flex items-center gap-2"
            :title="sortDirection === 'asc' ? 'По возрастанию' : 'По убыванию'"
          >
            <i class="fa-solid" :class="sortDirection === 'asc' ? 'fa-arrow-down-a-z' : 'fa-arrow-up-z-a'"></i>
            <span class="text-sm">{{ sortDirection === 'asc' ? 'A-Z' : 'Z-A' }}</span>
          </button>
        </div>

        <button
          @click="showAddModal = true"
          class="rounded-xl bg-accent px-6 py-2.5 font-bold text-forest-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/30 flex items-center gap-2"
        >
          <i class="fa-solid fa-plus"></i>
          <span>Добавить endpoint</span>
        </button>
      </div>

      <!-- Stats -->
      <div class="mb-6 flex items-center gap-4 text-sm text-cream-100/60">
        <span>Всего: <strong class="text-cream-100">{{ endpoints.length }}</strong></span>
        <span>•</span>
        <span>Показано: <strong class="text-cream-100">{{ filteredEndpoints.length }}</strong></span>
      </div>

      <!-- Endpoints List -->
      <div class="space-y-4">
        <div
          v-for="endpoint in filteredEndpoints"
          :key="endpoint.id"
          class="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10"
        >
          <!-- Endpoint Header -->
          <div
            class="flex items-center justify-between p-6 cursor-pointer"
            @click="endpoint.expanded = !endpoint.expanded"
          >
            <div class="flex items-center gap-4 flex-1">
              <!-- Method Badge -->
              <span
                class="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
                :class="getMethodColor(endpoint.method)"
              >
                {{ endpoint.method }}
              </span>

              <!-- Path -->
              <code class="text-cream-100 font-mono text-sm">
                {{ endpoint.path }}
              </code>

              <!-- Description -->
              <span class="text-cream-100/60 text-sm flex-1">
                {{ endpoint.description }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <!-- Auth Badge -->
              <span
                v-if="endpoint.auth"
                class="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[10px] font-bold text-amber-400 uppercase"
              >
                Auth Required
              </span>

              <!-- Expand Icon -->
              <i
                class="fa-solid fa-chevron-down text-cream-100/40 transition-transform duration-300"
                :class="{ 'rotate-180': endpoint.expanded }"
              ></i>
            </div>
          </div>

          <!-- Expanded Content -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-if="endpoint.expanded" class="border-t border-white/10 p-6">
              <div class="grid md:grid-cols-2 gap-6">
                <!-- Request Body -->
                <div>
                  <h4 class="text-cream-100 font-semibold mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-paper-plane text-accent"></i>
                    Request Body
                  </h4>
                  <div class="rounded-xl bg-black/40 border border-white/10 p-4">
                    <pre class="text-sm text-cream-100/80 overflow-x-auto"><code>{{ JSON.stringify(endpoint.requestBody, null, 2) }}</code></pre>
                  </div>

                  <!-- Parameters -->
                  <div v-if="endpoint.parameters && endpoint.parameters.length > 0" class="mt-4">
                    <h4 class="text-cream-100 font-semibold mb-3 flex items-center gap-2">
                      <i class="fa-solid fa-sliders text-accent"></i>
                      Parameters
                    </h4>
                    <div class="space-y-2">
                      <div
                        v-for="param in endpoint.parameters"
                        :key="param.name"
                        class="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                      >
                        <div class="flex items-center gap-2">
                          <code class="text-accent text-sm">{{ param.name }}</code>
                          <span class="text-cream-100/60 text-xs">{{ param.type }}</span>
                          <span v-if="param.required" class="text-red-400 text-xs">*</span>
                        </div>
                        <span class="text-cream-100/40 text-xs">{{ param.description }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Response -->
                <div>
                  <h4 class="text-cream-100 font-semibold mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-reply text-lime"></i>
                    Response
                  </h4>
                  <div class="rounded-xl bg-black/40 border border-white/10 p-4">
                    <pre class="text-sm text-cream-100/80 overflow-x-auto"><code>{{ JSON.stringify(endpoint.response, null, 2) }}</code></pre>
                  </div>

                  <!-- Actions -->
                  <div class="mt-4 flex gap-2">
                    <button
                      @click="copyToClipboard(endpoint)"
                      class="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-cream-100 transition-all hover:bg-white/10"
                    >
                      <i class="fa-regular fa-copy mr-2"></i>
                      Копировать
                    </button>
                    <button
                      @click="editEndpoint(endpoint)"
                      class="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-cream-100 transition-all hover:bg-white/10"
                    >
                      <i class="fa-solid fa-pen mr-2"></i>
                      Редактировать
                    </button>
                    <button
                      @click="deleteEndpoint(endpoint.id)"
                      class="flex-1 rounded-lg border border-terracotta/30 bg-terracotta/10 px-4 py-2 text-sm text-terracotta transition-all hover:bg-terracotta/20"
                    >
                      <i class="fa-solid fa-trash mr-2"></i>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Empty State -->
        <div v-if="filteredEndpoints.length === 0" class="text-center py-20">
          <i class="fa-solid fa-code text-6xl text-cream-100/20 mb-4"></i>
          <p class="text-cream-100/60 text-lg">Endpoint'ы не найдены</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showAddModal"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          @click.self="closeModal"
        >
          <div class="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-forest-400 border border-white/10 shadow-2xl">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-white/10 p-6">
              <h3 class="text-2xl font-bold text-cream-100">
                {{ editingId ? 'Редактировать endpoint' : 'Добавить endpoint' }}
              </h3>
              <button
                @click="closeModal"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-cream-100 hover:bg-white/20 transition-all"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-6">
              <!-- Method -->
              <div>
                <label class="block text-sm font-medium text-cream-100 mb-2">Method *</label>
                <select
                  v-model="formData.method"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream-100 outline-none focus:border-accent/50"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <!-- Path -->
              <div>
                <label class="block text-sm font-medium text-cream-100 mb-2">Path *</label>
                <input
                  v-model="formData.path"
                  type="text"
                  placeholder="/api/v1/animals"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream-100 placeholder:text-cream-100/40 outline-none focus:border-accent/50"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-cream-100 mb-2">Description *</label>
                <input
                  v-model="formData.description"
                  type="text"
                  placeholder="Описание endpoint'а"
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream-100 placeholder:text-cream-100/40 outline-none focus:border-accent/50"
                />
              </div>

              <!-- Auth Required -->
              <div class="flex items-center gap-3">
                <input
                  v-model="formData.auth"
                  type="checkbox"
                  id="auth"
                  class="h-4 w-4 rounded border-white/10 bg-white/5 text-accent focus:ring-accent"
                />
                <label for="auth" class="text-sm text-cream-100">Требуется авторизация</label>
              </div>

              <!-- Request Body (JSON) -->
              <div>
                <label class="block text-sm font-medium text-cream-100 mb-2">Request Body (JSON)</label>
                <textarea
                  v-model="requestBodyText"
                  rows="6"
                  placeholder='{&#10;  "name": "example",&#10;  "value": 123&#10;}'
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream-100 placeholder:text-cream-100/40 outline-none focus:border-accent/50 font-mono text-sm"
                ></textarea>
              </div>

              <!-- Response (JSON) -->
              <div>
                <label class="block text-sm font-medium text-cream-100 mb-2">Response (JSON)</label>
                <textarea
                  v-model="responseText"
                  rows="6"
                  placeholder='{&#10;  "success": true,&#10;  "data": {}&#10;}'
                  class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-cream-100 placeholder:text-cream-100/40 outline-none focus:border-accent/50 font-mono text-sm"
                ></textarea>
              </div>

              <!-- Parameters -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-cream-100">Parameters</label>
                  <button
                    @click="addParameter"
                    class="text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    <i class="fa-solid fa-plus mr-1"></i>
                    Добавить параметр
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(param, index) in formData.parameters"
                    :key="index"
                    class="flex items-center gap-2 rounded-lg bg-white/5 p-3"
                  >
                    <input
                      v-model="param.name"
                      type="text"
                      placeholder="name"
                      class="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/40 outline-none"
                    />
                    <select
                      v-model="param.type"
                      class="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-cream-100 outline-none"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="object">object</option>
                    </select>
                    <input
                      v-model="param.description"
                      type="text"
                      placeholder="описание"
                      class="flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-cream-100 placeholder:text-cream-100/40 outline-none"
                    />
                    <label class="flex items-center gap-1 text-xs text-cream-100/60">
                      <input
                        v-model="param.required"
                        type="checkbox"
                        class="rounded border-white/10 bg-black/20 text-accent"
                      />
                      Required
                    </label>
                    <button
                      @click="removeParameter(index)"
                      class="text-red-400 hover:text-red-300 transition-colors px-2"
                    >
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-3 border-t border-white/10 p-6">
              <button
                @click="closeModal"
                class="rounded-xl border border-white/10 px-6 py-3 text-cream-100 transition-all hover:bg-white/5"
              >
                Отмена
              </button>
              <button
                @click="saveEndpoint"
                class="rounded-xl bg-accent px-6 py-3 font-bold text-forest-900 transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/30"
              >
                {{ editingId ? 'Сохранить' : 'Добавить' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Parameter {
  name: string
  type: string
  description: string
  required: boolean
}

interface Endpoint {
  id: string
  method: string
  path: string
  description: string
  auth: boolean
  requestBody: Record<string, any>
  response: Record<string, any>
  parameters: Parameter[]
  expanded: boolean
}

const searchQuery = ref('')
const selectedMethod = ref('')
const sortBy = ref('path')
const sortDirection = ref<'asc' | 'desc'>('asc')
const showAddModal = ref(false)
const editingId = ref<string | null>(null)

const requestBodyText = ref('')
const responseText = ref('')

const formData = ref<Endpoint>({
  id: '',
  method: 'GET',
  path: '',
  description: '',
  auth: false,
  requestBody: {},
  response: {},
  parameters: [],
  expanded: false
})

// Default endpoints (оставляю ваш массив endpoints без изменений)
const endpoints = ref<Endpoint[]>([
  // ============================================
  // 🔐 AUTH
  // ============================================
  {
    id: 'auth-1',
    method: 'POST',
    path: '/api/v1/auth/register',
    description: 'Регистрация нового пользователя',
    auth: false,
    requestBody: {
      email: 'string',
      password: 'string',
      name: 'string'
    },
    response: {
      success: true,
      data: {
        id: 'string',
        email: 'string',
        name: 'string',
        token: 'string'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'auth-2',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Вход в систему',
    auth: false,
    requestBody: {
      email: 'string',
      password: 'string'
    },
    response: {
      success: true,
      data: {
        id: 'string',
        email: 'string',
        name: 'string',
        role: 'string',
        token: 'string'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'auth-3',
    method: 'POST',
    path: '/api/v1/auth/logout',
    description: 'Выход из системы',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Logged out successfully'
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'auth-4',
    method: 'POST',
    path: '/api/v1/auth/refresh',
    description: 'Обновление токена',
    auth: true,
    requestBody: {
      refreshToken: 'string'
    },
    response: {
      success: true,
      data: {
        token: 'string',
        refreshToken: 'string'
      }
    },
    parameters: [],
    expanded: false
  },

  // ============================================
  // 👤 USERS
  // ============================================
  {
    id: 'users-1',
    method: 'GET',
    path: '/api/v1/users/me',
    description: 'Получить мой профиль',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      data: {
        id: 'string',
        email: 'string',
        name: 'string',
        role: 'string',
        createdAt: 'string'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'users-2',
    method: 'PUT',
    path: '/api/v1/users/me',
    description: 'Обновить мой профиль',
    auth: true,
    requestBody: {
      name: 'string',
      email: 'string'
    },
    response: {
      success: true,
      data: 'object'
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'users-3',
    method: 'GET',
    path: '/api/v1/users',
    description: 'Список всех пользователей (admin)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      data: [],
      total: 'number'
    },
    parameters: [
      { name: 'page', type: 'number', description: 'Номер страницы', required: false },
      { name: 'limit', type: 'number', description: 'Записей на странице', required: false }
    ],
    expanded: false
  },

  // ============================================
  // 🦁 ANIMALS
  // ============================================
  {
    id: 'animals-1',
    method: 'GET',
    path: '/api/v1/animals',
    description: 'Получить список всех животных',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [
        {
          id: 'string',
          name: 'string',
          scientificName: 'string',
          zone: 'string',
          image: 'string',
          description: 'string',
          diet: 'string',
          weight: 'string',
          age: 'string',
          rating: 'number',
          reviewsCount: 'number'
        }
      ],
      total: 'number',
      page: 'number',
      limit: 'number'
    },
    parameters: [
      { name: 'zone', type: 'string', description: 'Фильтр по зоне', required: false },
      { name: 'search', type: 'string', description: 'Поиск по имени', required: false },
      { name: 'limit', type: 'number', description: 'Количество записей', required: false },
      { name: 'offset', type: 'number', description: 'Смещение', required: false },
      { name: 'sortBy', type: 'string', description: 'Сортировка (name, rating)', required: false }
    ],
    expanded: false
  },
  {
    id: 'animals-2',
    method: 'GET',
    path: '/api/v1/animals/:id',
    description: 'Получить животное по ID',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: {
        id: 'string',
        name: 'string',
        scientificName: 'string',
        zone: 'string',
        image: 'string',
        description: 'string',
        diet: 'string',
        weight: 'string',
        age: 'string',
        lifespan: 'string',
        rating: 'number',
        reviews: 'array'
      }
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID животного', required: true }
    ],
    expanded: false
  },
  {
    id: 'animals-3',
    method: 'POST',
    path: '/api/v1/animals',
    description: 'Создать новое животное (admin)',
    auth: true,
    requestBody: {
      name: 'string',
      scientificName: 'string',
      zone: 'string',
      image: 'string',
      description: 'string',
      diet: 'string',
      weight: 'string',
      age: 'string',
      lifespan: 'string'
    },
    response: {
      success: true,
      data: {
        id: 'string',
        name: 'string',
        createdAt: 'string'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'animals-4',
    method: 'PUT',
    path: '/api/v1/animals/:id',
    description: 'Обновить животное (admin)',
    auth: true,
    requestBody: {
      name: 'string',
      description: 'string',
      weight: 'string',
      age: 'string'
    },
    response: {
      success: true,
      message: 'string',
      data: 'object'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID животного', required: true }
    ],
    expanded: false
  },
  {
    id: 'animals-5',
    method: 'DELETE',
    path: '/api/v1/animals/:id',
    description: 'Удалить животное (admin)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Animal deleted successfully'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID животного', required: true }
    ],
    expanded: false
  },
  {
    id: 'animals-6',
    method: 'GET',
    path: '/api/v1/animals/zone/:zoneId',
    description: 'Животные по зоне',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [],
      total: 'number'
    },
    parameters: [
      { name: 'zoneId', type: 'string', description: 'ID зоны', required: true }
    ],
    expanded: false
  },

  // ============================================
  //  ZONES
  // ============================================
  {
    id: 'zones-1',
    method: 'GET',
    path: '/api/v1/zones',
    description: 'Получить список всех зон',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [
        {
          id: 'string',
          name: 'string',
          location: 'string',
          image: 'string',
          description: 'string',
          climate: 'string',
          hours: 'string',
          animalsCount: 'number'
        }
      ]
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'zones-2',
    method: 'GET',
    path: '/api/v1/zones/:id',
    description: 'Детали зоны',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: {
        id: 'string',
        name: 'string',
        location: 'string',
        image: 'string',
        description: 'string',
        fullDescription: 'string',
        climate: 'string',
        hours: 'string',
        animals: 'array'
      }
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID зоны', required: true }
    ],
    expanded: false
  },
  {
    id: 'zones-3',
    method: 'POST',
    path: '/api/v1/zones',
    description: 'Создать зону (admin)',
    auth: true,
    requestBody: {
      name: 'string',
      location: 'string',
      image: 'string',
      description: 'string',
      climate: 'string',
      hours: 'string'
    },
    response: {
      success: true,
      data: {
        id: 'string',
        name: 'string'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'zones-4',
    method: 'PUT',
    path: '/api/v1/zones/:id',
    description: 'Обновить зону (admin)',
    auth: true,
    requestBody: {
      name: 'string',
      description: 'string',
      hours: 'string'
    },
    response: {
      success: true,
      message: 'string'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID зоны', required: true }
    ],
    expanded: false
  },
  {
    id: 'zones-5',
    method: 'DELETE',
    path: '/api/v1/zones/:id',
    description: 'Удалить зону (admin)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Zone deleted successfully'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID зоны', required: true }
    ],
    expanded: false
  },

  // ============================================
  // 📸 GALLERY
  // ============================================
  {
    id: 'gallery-1',
    method: 'GET',
    path: '/api/v1/gallery',
    description: 'Получить список фото',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [
        {
          id: 'string',
          image: 'string',
          alt: 'string',
          caption: 'string'
        }
      ],
      total: 'number'
    },
    parameters: [
      { name: 'limit', type: 'number', description: 'Количество фото', required: false },
      { name: 'offset', type: 'number', description: 'Смещение', required: false }
    ],
    expanded: false
  },
  {
    id: 'gallery-2',
    method: 'POST',
    path: '/api/v1/gallery',
    description: 'Загрузить фото (admin)',
    auth: true,
    requestBody: {
      image: 'string',
      alt: 'string',
      caption: 'string'
    },
    response: {
      success: true,
      data: {
        id: 'string',
        image: 'string'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'gallery-3',
    method: 'DELETE',
    path: '/api/v1/gallery/:id',
    description: 'Удалить фото (admin)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Photo deleted'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID фото', required: true }
    ],
    expanded: false
  },

  // ============================================
  // 💬 REVIEWS
  // ============================================
  {
    id: 'reviews-1',
    method: 'GET',
    path: '/api/v1/reviews',
    description: 'Получить список отзывов',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [
        {
          id: 'string',
          animalId: 'string',
          author: 'string',
          rating: 'number',
          text: 'string',
          date: 'string'
        }
      ],
      total: 'number'
    },
    parameters: [
      { name: 'animalId', type: 'string', description: 'Фильтр по животному', required: false },
      { name: 'limit', type: 'number', description: 'Количество', required: false }
    ],
    expanded: false
  },
  {
    id: 'reviews-2',
    method: 'POST',
    path: '/api/v1/reviews',
    description: 'Создать отзыв (auth)',
    auth: true,
    requestBody: {
      animalId: 'string',
      author: 'string',
      rating: 'number',
      text: 'string'
    },
    response: {
      success: true,
      data: {
        id: 'string',
        createdAt: 'string'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'reviews-3',
    method: 'PUT',
    path: '/api/v1/reviews/:id',
    description: 'Обновить свой отзыв',
    auth: true,
    requestBody: {
      rating: 'number',
      text: 'string'
    },
    response: {
      success: true,
      message: 'Review updated'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID отзыва', required: true }
    ],
    expanded: false
  },
  {
    id: 'reviews-4',
    method: 'DELETE',
    path: '/api/v1/reviews/:id',
    description: 'Удалить отзыв (admin/owner)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Review deleted'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID отзыва', required: true }
    ],
    expanded: false
  },
  {
    id: 'reviews-5',
    method: 'GET',
    path: '/api/v1/reviews/animal/:animalId',
    description: 'Отзывы о конкретном животном',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [],
      total: 'number',
      averageRating: 'number'
    },
    parameters: [
      { name: 'animalId', type: 'string', description: 'ID животного', required: true }
    ],
    expanded: false
  },

  // ============================================
  //  TICKETS
  // ============================================
  {
    id: 'tickets-1',
    method: 'GET',
    path: '/api/v1/tickets/types',
    description: 'Типы билетов',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [
        {
          id: 'string',
          name: 'string',
          description: 'string',
          price: 'number'
        }
      ]
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'tickets-2',
    method: 'POST',
    path: '/api/v1/tickets',
    description: 'Забронировать билет (auth)',
    auth: true,
    requestBody: {
      ticketTypeId: 'string',
      date: 'string',
      quantity: 'number'
    },
    response: {
      success: true,
      data: {
        id: 'string',
        qrCode: 'string',
        totalPrice: 'number'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'tickets-3',
    method: 'GET',
    path: '/api/v1/tickets/my',
    description: 'Мои билеты (auth)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      data: []
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'tickets-4',
    method: 'PUT',
    path: '/api/v1/tickets/:id/cancel',
    description: 'Отменить билет',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Ticket cancelled'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID билета', required: true }
    ],
    expanded: false
  },

  // ============================================
  // 📅 EVENTS
  // ============================================
  {
    id: 'events-1',
    method: 'GET',
    path: '/api/v1/events',
    description: 'Список событий',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [
        {
          id: 'string',
          title: 'string',
          description: 'string',
          date: 'string',
          category: 'string',
          price: 'string',
          button: 'string'
        }
      ]
    },
    parameters: [
      { name: 'category', type: 'string', description: 'Фильтр по категории', required: false },
      { name: 'upcoming', type: 'boolean', description: 'Только будущие', required: false }
    ],
    expanded: false
  },
  {
    id: 'events-2',
    method: 'GET',
    path: '/api/v1/events/:id',
    description: 'Детали события',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: 'object'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID события', required: true }
    ],
    expanded: false
  },
  {
    id: 'events-3',
    method: 'POST',
    path: '/api/v1/events',
    description: 'Создать событие (admin)',
    auth: true,
    requestBody: {
      title: 'string',
      description: 'string',
      date: 'string',
      category: 'string',
      price: 'string',
      button: 'string'
    },
    response: {
      success: true,
      data: { id: 'string' }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'events-4',
    method: 'DELETE',
    path: '/api/v1/events/:id',
    description: 'Удалить событие (admin)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Event deleted'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID события', required: true }
    ],
    expanded: false
  },
  {
    id: 'events-5',
    method: 'POST',
    path: '/api/v1/events/:id/register',
    description: 'Записаться на событие (auth)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      message: 'Registered successfully'
    },
    parameters: [
      { name: 'id', type: 'string', description: 'ID события', required: true }
    ],
    expanded: false
  },

  // ============================================
  // 🕐 VISIT
  // ============================================
  {
    id: 'visit-1',
    method: 'GET',
    path: '/api/v1/visit/hours',
    description: 'Часы работы',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: [
        {
          day: 'string',
          time: 'string'
        }
      ]
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'visit-2',
    method: 'PUT',
    path: '/api/v1/visit/hours',
    description: 'Обновить часы работы (admin)',
    auth: true,
    requestBody: {
      hours: 'array'
    },
    response: {
      success: true,
      message: 'Hours updated'
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'visit-3',
    method: 'GET',
    path: '/api/v1/visit/prices',
    description: 'Цены на билеты',
    auth: false,
    requestBody: {},
    response: {
      success: true,
      data: []
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'visit-4',
    method: 'PUT',
    path: '/api/v1/visit/prices',
    description: 'Обновить цены (admin)',
    auth: true,
    requestBody: {
      prices: 'array'
    },
    response: {
      success: true,
      message: 'Prices updated'
    },
    parameters: [],
    expanded: false
  },

  // ============================================
  // 📊 STATISTICS (admin)
  // ============================================
  {
    id: 'stats-1',
    method: 'GET',
    path: '/api/v1/stats/overview',
    description: 'Общая статистика (admin)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      data: {
        totalAnimals: 'number',
        totalZones: 'number',
        totalVisitors: 'number',
        totalRevenue: 'number'
      }
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'stats-2',
    method: 'GET',
    path: '/api/v1/stats/popular-animals',
    description: 'Популярные животные (admin)',
    auth: true,
    requestBody: {},
    response: {
      success: true,
      data: []
    },
    parameters: [
      { name: 'limit', type: 'number', description: 'Количество', required: false }
    ],
    expanded: false
  },

  // ============================================
  // 🔧 SYSTEM
  // ============================================
  {
    id: 'system-1',
    method: 'GET',
    path: '/api/v1/health',
    description: 'Проверка состояния сервера',
    auth: false,
    requestBody: {},
    response: {
      status: 'ok',
      uptime: 'number',
      version: 'string'
    },
    parameters: [],
    expanded: false
  },
  {
    id: 'system-2',
    method: 'POST',
    path: '/api/v1/upload',
    description: 'Загрузить файл',
    auth: true,
    requestBody: {
      file: 'File'
    },
    response: {
      success: true,
      data: {
        url: 'string',
        filename: 'string'
      }
    },
    parameters: [],
    expanded: false
  }
])

const filteredEndpoints = computed(() => {
  let result = endpoints.value.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesMethod = !selectedMethod.value || endpoint.method === selectedMethod.value
    return matchesSearch && matchesMethod
  })

  // Сортировка
  result = [...result].sort((a, b) => {
    let comparison = 0

    switch (sortBy.value) {
      case 'path':
        comparison = a.path.localeCompare(b.path)
        break
      case 'method':
        comparison = a.method.localeCompare(b.method)
        break
      case 'description':
        comparison = a.description.localeCompare(b.description)
        break
      case 'auth':
        comparison = Number(a.auth) - Number(b.auth)
        break
    }

    return sortDirection.value === 'asc' ? comparison : -comparison
  })

  return result
})

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'bg-lime/20 text-lime border border-lime/30',
    POST: 'bg-accent/20 text-accent border border-accent/30',
    PUT: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    DELETE: 'bg-terracotta/20 text-terracotta border border-terracotta/30'
  }
  return colors[method] || 'bg-white/10 text-white border border-white/20'
}

const addParameter = () => {
  formData.value.parameters.push({
    name: '',
    type: 'string',
    description: '',
    required: false
  })
}

const removeParameter = (index: number) => {
  formData.value.parameters.splice(index, 1)
}

const copyToClipboard = (endpoint: Endpoint) => {
  const text = `${endpoint.method} ${endpoint.path}\n\nRequest:\n${JSON.stringify(endpoint.requestBody, null, 2)}\n\nResponse:\n${JSON.stringify(endpoint.response, null, 2)}`
  navigator.clipboard.writeText(text)
}

const editEndpoint = (endpoint: Endpoint) => {
  editingId.value = endpoint.id
  formData.value = { ...endpoint }
  requestBodyText.value = JSON.stringify(endpoint.requestBody, null, 2)
  responseText.value = JSON.stringify(endpoint.response, null, 2)
  showAddModal.value = true
}

const deleteEndpoint = (id: string) => {
  if (confirm('Удалить этот endpoint?')) {
    endpoints.value = endpoints.value.filter(e => e.id !== id)
  }
}

const saveEndpoint = () => {
  try {
    const requestBody = requestBodyText.value ? JSON.parse(requestBodyText.value) : {}
    const response = responseText.value ? JSON.parse(responseText.value) : {}

    if (editingId.value) {
      const index = endpoints.value.findIndex(e => e.id === editingId.value)
      if (index !== -1) {
        endpoints.value[index] = {
          ...formData.value,
          requestBody,
          response
        }
      }
    } else {
      endpoints.value.push({
        ...formData.value,
        id: Date.now().toString(),
        requestBody,
        response,
        expanded: false
      })
    }
    closeModal()
  } catch (error) {
    alert('Ошибка JSON: ' + (error as Error).message)
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingId.value = null
  formData.value = {
    id: '',
    method: 'GET',
    path: '',
    description: '',
    auth: false,
    requestBody: {},
    response: {},
    parameters: [],
    expanded: false
  }
  requestBodyText.value = ''
  responseText.value = ''
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>