<template>
  <div id="app">
    <template v-if="route.path.startsWith('/user')">
      <UserLayout />
    </template>
    <template v-else-if="route.path.startsWith('/app/gen')">
      <ChatLayout />
    </template>
    <template v-else>
      <BasicLayout />
    </template>
  </div>
</template>

<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
import ChatLayout from '@/layouts/ChatLayout.vue'
import UserLayout from '@/layouts/UserLayout.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
