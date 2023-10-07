<script setup lang="ts">
import { IconButton } from '@/components/IconButton'
</script>

<template>
  <div class="back-button">
    <IconButton color="main-light" icon="hand-point-left" />
  </div>
</template>

<style lang="scss" scoped>
.back-button {
  position: absolute;
  top: 0.5rem;
  left: 1rem;

  z-index: 30;
}
</style>
