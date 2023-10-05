<script setup lang="ts"></script>

<template>
  <div class="home">
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.home {
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;

  background-color: #ffffff;
  opacity: 1;
  background-image: linear-gradient(#e6ffe6 3.6px, transparent 3.6px),
    linear-gradient(90deg, #e6ffe6 3.6px, transparent 3.6px),
    linear-gradient(#e6ffe6 1.8px, transparent 1.8px),
    linear-gradient(90deg, #e6ffe6 1.8px, #ffffff 1.8px);
  background-size: 90px 90px, 90px 90px, 18px 18px, 18px 18px;
  background-position: -3.6px -3.6px, -3.6px -3.6px, -1.8px -1.8px,
    -1.8px -1.8px;
}
</style>
