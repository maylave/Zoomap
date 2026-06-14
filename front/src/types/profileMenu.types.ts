import type { IconName } from '@/icons'

export interface MenuItem {
  id: string
  label: string
  description: string
  icon: IconName  



  
  badge?: string | number
}

export interface MenuGroup {
  title: string
  items: MenuItem[]
}

export interface MenuContext {
  label: string
  description: string
}

export interface AdminUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'moderator' | 'user'
  status: 'active' | 'blocked' | 'pending'
  registeredAt: string
  lastLogin: string
}