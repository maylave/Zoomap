import api from './api'

export const adminService = {
  // ==================== DASHBOARD ====================
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard')
    return response.data
  },

  // ==================== USERS ====================
  getUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  updateUserRole: async (id: number, role: string) => {
    const response = await api.put(`/admin/users/${id}/role`, { role })
    return response.data
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  // ==================== ANIMALS ====================
  getAnimals: async () => {
    const response = await api.get('/admin/animals')
    return response.data
  },

  createAnimal: async (data: any) => {
    const response = await api.post('/admin/animals', data)
    return response.data
  },

  updateAnimal: async (id: number, data: any) => {
    const response = await api.put(`/admin/animals/${id}`, data)
    return response.data
  },

  deleteAnimal: async (id: number) => {
    const response = await api.delete(`/admin/animals/${id}`)
    return response.data
  },

  // ==================== ZONES ====================
  getZones: async () => {
    const response = await api.get('/admin/zones')
    return response.data
  },

  createZone: async (data: any) => {
    const response = await api.post('/admin/zones', data)
    return response.data
  },

  updateZone: async (id: number, data: any) => {
    const response = await api.put(`/admin/zones/${id}`, data)
    return response.data
  },

  deleteZone: async (id: number) => {
    const response = await api.delete(`/admin/zones/${id}`)
    return response.data
  },

  // ==================== EVENTS ====================
  getEvents: async () => {
    const response = await api.get('/admin/events')
    return response.data
  },

  createEvent: async (data: any) => {
    const response = await api.post('/admin/events', data)
    return response.data
  },

  updateEvent: async (id: number, data: any) => {
    const response = await api.put(`/admin/events/${id}`, data)
    return response.data
  },

  deleteEvent: async (id: number) => {
    const response = await api.delete(`/admin/events/${id}`)
    return response.data
  },

  // ==================== TICKET TYPES ====================
  getTicketTypes: async () => {
    const response = await api.get('/admin/ticket-types')
    return response.data
  },

  createTicketType: async (data: any) => {
    const response = await api.post('/admin/ticket-types', data)
    return response.data
  },

  updateTicketType: async (id: number, data: any) => {
    const response = await api.put(`/admin/ticket-types/${id}`, data)
    return response.data
  },

  deleteTicketType: async (id: number) => {
    const response = await api.delete(`/admin/ticket-types/${id}`)
    return response.data
  },

  // ==================== BOOKINGS ====================
  getBookings: async () => {
    const response = await api.get('/admin/bookings')
    return response.data
  },

  getBookingById: async (id: number) => {
    const response = await api.get(`/admin/bookings/${id}`)
    return response.data
  },

  updateBookingStatus: async (id: number, status: string) => {
    const response = await api.patch(`/admin/bookings/${id}/status`, { status })
    return response.data
  },

  deleteBooking: async (id: number) => {
    const response = await api.delete(`/admin/bookings/${id}`)
    return response.data
  },

  // ==================== REVIEWS ====================
  getReviews: async () => {
    const response = await api.get('/admin/reviews')
    return response.data
  },

  deleteReview: async (id: number) => {
    const response = await api.delete(`/admin/reviews/${id}`)
    return response.data
  },

  // ==================== WORKING HOURS ====================
  getWorkingHours: async () => {
    const response = await api.get('/admin/working-hours')
    return response.data
  },

  createWorkingHour: async (data: any) => {
    const response = await api.post('/admin/working-hours', data)
    return response.data
  },

  updateWorkingHour: async (id: number, data: any) => {
    const response = await api.put(`/admin/working-hours/${id}`, data)
    return response.data
  },

  deleteWorkingHour: async (id: number) => {
    const response = await api.delete(`/admin/working-hours/${id}`)
    return response.data
  },

  // ==================== TICKER ====================
  getTickerItems: async () => {
    const response = await api.get('/admin/ticker')
    return response.data
  },

  createTickerItem: async (data: any) => {
    const response = await api.post('/admin/ticker', data)
    return response.data
  },

  updateTickerItem: async (id: number, data: any) => {
    const response = await api.put(`/admin/ticker/${id}`, data)
    return response.data
  },

  deleteTickerItem: async (id: number) => {
    const response = await api.delete(`/admin/ticker/${id}`)
    return response.data
  },

  // ==================== PHOTO ALBUMS ====================
  getPhotoAlbums: async () => {
    const response = await api.get('/admin/photo-albums')
    return response.data
  },

  deletePhotoAlbum: async (id: number) => {
    const response = await api.delete(`/admin/photo-albums/${id}`)
    return response.data
  },

  // ==================== PHOTOS ====================
  getPhotos: async () => {
    const response = await api.get('/admin/photos')
    return response.data
  },

  deletePhoto: async (id: number) => {
    const response = await api.delete(`/admin/photos/${id}`)
    return response.data
  },
}
