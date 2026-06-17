import api from './api'

export interface LoginRequest {
  identifier: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
}

export interface AuthResponse {
  user: {
    id: number
    name: string
    email: string
    login: string
    role: string
  }
  token: string
  password?: string // Сгенерированный пароль при регистрации
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await api.post('/auth/change-password', data)
    return response.data
  },
}
