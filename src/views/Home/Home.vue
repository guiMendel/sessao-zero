<script setup lang="ts">
import { PlayerPanel } from './PlayerPanel'
</script>

<template>
  <div class="home">
    <PlayerPanel />

    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.home {
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;

  background-color: #ffffff;
  background-image: linear-gradient(#e6ffe6 3.6px, transparent 3.6px),
    linear-gradient(90deg, #e6ffe6 3.6px, transparent 3.6px),
    linear-gradient(#e6ffe6 1.8px, transparent 1.8px),
    linear-gradient(90deg, #e6ffe6 1.8px, #ffffff 1.8px);
  background-size: 90px 90px, 90px 90px, 18px 18px, 18px 18px;
  background-position: -3.6px -3.6px, -3.6px -3.6px, -1.8px -1.8px,
    -1.8px -1.8px;

  @include high-contrast {
    background: none;
  }
}
</style>
