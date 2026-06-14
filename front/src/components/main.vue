<template>
  <Header @open-profile="isProfileOpen = true" />
  
    <Hero />
  

    <Marquee />

<EditableSection
  @edit="editEvents"
  :actions="[
    { 
      label: 'Изменить заголовок', 
      icon: 'fa-solid fa-heading',
      onClick: editTitle 
    },
    { 
      label: 'Изменить фон', 
      icon: 'fa-solid fa-image',
      onClick: editBackground 
    },
    { 
      label: 'Удалить', 
      icon: 'fa-solid fa-trash',
      variant: 'danger',
      onClick: deleteSection 
    },
  ]"
>
  <Events />
</EditableSection>
  <Gallery />
  <Visit />
  <Form />


  <UserProfile 
    :visible="isProfileOpen" 
    @close="isProfileOpen = false" 
  />
</template>

<script setup lang="ts">
import EditableSection from './layout/EditableSection.vue'
import { ref } from 'vue'
import Header from '@/components/header.vue'
import UserProfile from './overlay/UserProfile.vue'
import Hero from '@/components/hero.vue'
import Events from './home/events.vue'
import Form from './home/form.vue'
import Gallery from './home/gallery.vue'
import Marquee from './home/marquee.vue'
import Visit from './home/visit.vue'


const openHeroEditor = () => {
  console.log('Редактировать Gallery')
}
const isProfileOpen = ref(false)
</script>