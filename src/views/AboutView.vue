<template>
  <div class="about">
    <div class="about-content">
      <h2 class="title">关于平台</h2>
      <p class="desc">
        这不仅是一个工具，更是未来创作的延伸。我们致力于打破编程门槛，利用最先进的
        <span class="highlight">大语言模型</span>
        辅助生成逻辑与布局卡片。任何人都可以成为优秀的独立创造者。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.about {
  padding: 80px 24px;
  display: flex;
  justify-content: center;
  animation: fadeIn 0.8s ease forwards;
}

.about-content {
  max-width: 640px;
  text-align: center;
}

.title {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  position: relative;
  display: inline-block;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
}

.desc {
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-secondary);
  text-align: justify;
  text-justify: inter-ideograph;
}

.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
