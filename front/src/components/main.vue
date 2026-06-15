<template>
  <Header @open-profile="isProfileOpen = true" />
  
  <EditableSection
    @edit="editHero"
    :actions="[
      { 
        label: 'Режим редактирования', 
        icon: 'fa-solid fa-pen-to-square',
        onClick: toggleHeroEditMode 
      },
      { 
        label: 'Изменить фон', 
        icon: 'fa-solid fa-image',
        onClick: editHeroBackground 
      },
    ]"
  >
    <Hero ref="heroRef" />
  </EditableSection>

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
        label: 'Удалить события', 
        icon: 'fa-solid fa-trash',
        variant: 'danger',
        onClick: enableEventsDeleteMode 
      },
    ]"
  >
    <Events ref="eventsRef" />
  </EditableSection>

  <EditableSection
    @edit="editGallery"
    :actions="[
      { 
        label: 'Изменить заголовок', 
        icon: 'fa-solid fa-heading',
        onClick: editGalleryTitle 
      },
      { 
        label: 'Изменить описание', 
        icon: 'fa-solid fa-align-left',
        onClick: editGalleryDescription 
      },
      { 
        label: 'Удалить фото', 
        icon: 'fa-solid fa-trash',
        variant: 'danger',
        onClick: enableGalleryDeleteMode 
      },
    ]"
  >
    <Gallery ref="galleryRef" />
  </EditableSection>

  <EditableSection
    @edit="editVisit"
    :actions="[
      { 
        label: 'Изменить заголовок', 
        icon: 'fa-solid fa-heading',
        onClick: editVisitTitle 
      },
      { 
        label: 'Изменить описание', 
        icon: 'fa-solid fa-align-left',
        onClick: editVisitDescription 
      },
      { 
        label: 'Удалить билеты', 
        icon: 'fa-solid fa-trash',
        variant: 'danger',
        onClick: enableVisitDeleteMode 
      },
    ]"
  >
    <Visit ref="visitRef" />
  </EditableSection>

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

const heroRef = ref<InstanceType<typeof Hero> | null>(null)
const eventsRef = ref<InstanceType<typeof Events> | null>(null)
const galleryRef = ref<InstanceType<typeof Gallery> | null>(null)
const visitRef = ref<InstanceType<typeof Visit> | null>(null)
const isProfileOpen = ref(false)

// Hero handlers
const editHero = () => {
  console.log('Редактировать Hero')
}

const toggleHeroEditMode = () => {
  heroRef.value?.toggleEditMode()
}

const editHeroBackground = () => {
  console.log('Изменить фон Hero')
}

// Events handlers
const editEvents = () => {
  console.log('Редактировать Events')
}

const editTitle = () => {
  console.log('Изменить заголовок Events')
}

const editBackground = () => {
  console.log('Изменить фон Events')
}

const enableEventsDeleteMode = () => {
  eventsRef.value?.enableDeleteMode()
}

// Gallery handlers
const editGallery = () => {
  console.log('Редактировать Gallery')
}

const editGalleryTitle = () => {
  console.log('Изменить заголовок Gallery')
}

const editGalleryDescription = () => {
  console.log('Изменить описание Gallery')
}

const enableGalleryDeleteMode = () => {
  galleryRef.value?.enableDeleteMode()
}

// Visit handlers
const editVisit = () => {
  console.log('Редактировать Visit')
}

const editVisitTitle = () => {
  console.log('Изменить заголовок Visit')
}

const editVisitDescription = () => {
  console.log('Изменить описание Visit')
}

const enableVisitDeleteMode = () => {
  visitRef.value?.enableDeleteMode()
}
</script>