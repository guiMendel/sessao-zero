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
  max-width: 100%;
}
</style>
