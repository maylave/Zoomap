import api from './api'

export interface AdminUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  status: 'active' | 'blocked' | 'pending'
  registeredAt: string
  lastLogin: string
  tempPassword?: string
}

export interface UsersResponse {
  users: AdminUser[]
  total: number
}

export interface CreateUserInput {
  firstName: string
  lastName?: string
  email: string
  role?: 'admin' | 'moderator' | 'user'
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  role?: 'admin' | 'moderator' | 'user'
  status?: 'active' | 'blocked' | 'pending'
}

export const usersService = {
  getAll: async (params?: {
    role?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }): Promise<UsersResponse> => {
    const response = await api.get('/admin/users', { params })

    console.log('🔍 Raw API response:', response.data)

    // Если приходит массив — обрабатываем
    if (Array.isArray(response.data)) {
      // Преобразуем данные: если есть name но нет firstName/lastName
      const users = response.data.map((user: any) => ({
        ...user,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        status: user.status || 'active',
        registeredAt: user.registeredAt || user.createdAt?.split('T')[0] || '',
        lastLogin: user.lastLogin || 'Недавно',
      }))

      console.log('✅ Processed users:', users)

      return {
        users,
        total: users.length,
      }
    }

    return response.data
  },

  create: async (data: CreateUserInput): Promise<AdminUser> => {
    const response = await api.post('/admin/users/create', data)
    return response.data
  },

  update: async (id: number, data: UpdateUserInput): Promise<AdminUser> => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },
}
