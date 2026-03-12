<template>
  <a-layout class="chat-layout">
    <a-layout-header class="header">
      <GlobalHeader />
    </a-layout-header>
    <a-layout-content class="chat-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
.chat-layout {
  height: 100vh;
  background-color: var(--bg-body);
}
.header {
  background: transparent;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 64px;
}
.chat-content {
  flex: 1;
  padding: 0;
  width: 100%;
  overflow: hidden;
}
</style>
