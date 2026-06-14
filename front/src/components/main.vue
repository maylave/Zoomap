<template>
  <Header @open-profile="isProfileOpen = true" />
  
  <Hero />
  <Marquee />
  <Events />
  <Gallery />
  <Visit />
  <Form />


  <UserProfile 
    :visible="isProfileOpen" 
    @close="isProfileOpen = false" 
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Header from '@/components/header.vue'
import UserProfile from './overlay/UserProfile.vue'
import Hero from '@/components/hero.vue'
import Events from './home/events.vue'
import Form from './home/form.vue'
import Gallery from './home/gallery.vue'
import Marquee from './home/marquee.vue'
import Visit from './home/visit.vue'

// ✅ Состояние модалки
const isProfileOpen = ref(false)
</script>