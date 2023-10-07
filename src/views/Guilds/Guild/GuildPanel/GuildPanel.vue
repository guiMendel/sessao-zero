<script setup lang="ts">
import { IconButton } from '@/components/IconButton'
</script>

<template>
  <div class="guild-panel-toggle">
    <IconButton color="main-light" icon="bars" />
  </div>
</template>

<style lang="scss" scoped>
.guild-panel-toggle {
  position: absolute;
  top: 1rem;
  left: 1.5rem;

  z-index: 30;

  font-size: 2.2rem;
}
</style>
