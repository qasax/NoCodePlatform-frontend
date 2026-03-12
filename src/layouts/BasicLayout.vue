<template>
  <a-layout class="basic-layout">
    <a-layout-header class="bl-header">
      <GlobalHeader />
    </a-layout-header>
    <a-layout-content class="bl-content">
      <router-view />
    </a-layout-content>
    <div class="bl-footer">
      <span>© 2025 NoCode AI Platform &nbsp;·&nbsp; 企业级无代码开发平台</span>
    </div>
  </a-layout>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<style scoped>
.basic-layout {
  min-height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
}

.bl-header {
  background: transparent;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
}

.bl-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 36px 40px;
}

.bl-footer {
  text-align: center;
  padding: 20px 0;
  font-size: 12.5px;
  color: var(--c-text-3);
  border-top: 1px solid rgba(79, 110, 242, 0.07);
  letter-spacing: 0.04em;
}
</style>
