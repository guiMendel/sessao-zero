<script setup lang="ts">
import { useCurrentPlayer } from '@/stores'

const { logout } = useCurrentPlayer()
</script>

<template>
  <div class="home">
    <p>In Home</p>

    <button @click="logout">Logout</button>

    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.home {
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
</style>