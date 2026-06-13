<template>
  <Hero></Hero>
  <Marquee/>
  <Events/>
  <Gallery/>
<Visit/>

<Form/>


<UserProfile :visible="true" />

</template>


<script setup lang="ts">
import UserProfile from './overlay/UserProfile.vue'

import Hero from '@/components/hero.vue'
import Events from './home/events.vue'
import Form from './home/form.vue'
import Gallery from './home/gallery.vue'
import Marquee from './home/marquee.vue'
import Visit from './home/visit.vue'
</script>