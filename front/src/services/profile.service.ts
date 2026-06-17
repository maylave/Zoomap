import api from './api'

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/profile')
    return response.data
  },

  updateProfile: async (data: { name?: string; email?: string; phone?: string }) => {
    const response = await api.put('/profile', data)
    return response.data
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await api.post('/profile/change-password', data)
    return response.data
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)

    // ❌ УБРАЛИ: headers: { 'Content-Type': 'multipart/form-data' }
    // ✅ Axios сам установит правильный Content-Type с boundary
    const response = await api.post('/profile/avatar', formData)
    return response.data
  },

  deleteAvatar: async () => {
    const response = await api.delete('/profile/avatar')
    return response.data
  },

  deleteAccount: async () => {
    const response = await api.delete('/profile/account')
    return response.data
  },

  getSettings: async () => {
    const response = await api.get('/profile/settings')
    return response.data
  },

  updateSettings: async (settings: any) => {
    const response = await api.put('/profile/settings', settings)
    return response.data
  },

  getPurchases: async () => {
    const response = await api.get('/profile/purchases')
    return response.data
  },
}
