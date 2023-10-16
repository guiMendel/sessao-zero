<script setup lang="ts">
import { PlayerPanel } from './PlayerPanel'
</script>

<template>
  <div class="home preset-grid-background">
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

  @include high-contrast {
    background: none;
  }
}
</style>
