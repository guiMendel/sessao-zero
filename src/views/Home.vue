<script setup lang="ts">
import { useCurrentPlayer } from '../stores'

const { logout } = useCurrentPlayer()
</script>

<template>
  <div>
    <p>In Home</p>

    <button @click="logout">Logout</button>

    <RouterView />
  </div>
</template>
