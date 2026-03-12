<template>
  <div class="user-layout">
    <!-- Ambient background lights -->
    <div class="ambient-light al-1" />
    <div class="ambient-light al-2" />
    <div class="ambient-light al-3" />

    <div class="ul-content">
      <!-- Brand mark -->
      <div class="ul-brand">
        <div class="ul-logo-ring">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="M2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h1 class="ul-title">NoCode <span>AI</span></h1>
        <p class="ul-subtitle">企业级无代码开发平台</p>
      </div>

      <!-- Card slot -->
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.user-layout {
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
  /* Layered mesh background */
  background-color: var(--c-bg);
  background-image:
    radial-gradient(ellipse 90% 70% at 15% 10%, rgba(79, 110, 242, 0.13) 0%, transparent 55%),
    radial-gradient(ellipse 70% 60% at 85% 90%, rgba(200, 169, 110, 0.1) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 50% 50%, rgba(61, 189, 135, 0.06) 0%, transparent 60%);
  background-attachment: fixed;
}

/* ——— Ambient blobs ——— */
.ambient-light {
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.al-1 {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(79, 110, 242, 0.12), transparent 70%);
  top: -250px;
  left: -250px;
  animation: floatOrb 14s ease-in-out infinite alternate;
}

.al-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(200, 169, 110, 0.09), transparent 70%);
  bottom: -150px;
  right: -150px;
  animation: floatOrb 18s ease-in-out infinite alternate-reverse;
}

.al-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(61, 189, 135, 0.07), transparent 70%);
  top: 50%;
  left: 60%;
  animation: floatOrb 22s ease-in-out infinite alternate;
}

@keyframes floatOrb {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(30px, 20px) scale(1.05);
  }
}

/* ——— Content area ——— */
.ul-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px 20px;
  gap: 0;
}

/* ——— Brand ——— */
.ul-brand {
  text-align: center;
  margin-bottom: 32px;
}

.ul-logo-ring {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 8px 32px rgba(79, 110, 242, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-primary);
  margin: 0 auto 20px;
}

.ul-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 40px;
  font-weight: 800;
  color: var(--c-text-1);
  margin: 0 0 10px;
  letter-spacing: -1.5px;
  line-height: 1;
}

.ul-title span {
  color: var(--c-primary);
}

.ul-subtitle {
  font-size: 14px;
  color: var(--c-text-3);
  margin: 0;
  letter-spacing: 0.06em;
  font-weight: 500;
}
</style>
