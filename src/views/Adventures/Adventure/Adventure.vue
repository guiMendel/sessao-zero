<script setup lang="ts">
import genericBanner from '@/assets/adventure-generic.png'
import { useCurrentAdventure } from '@/api/adventures/useCurrentAdventure'
import { LoadingSpinner, Typography } from '@/components'

const { adventure } = useCurrentAdventure()
</script>

<template>
  <LoadingSpinner v-if="!adventure" />

  <div v-else class="adventure">
    <img :src="genericBanner" alt="capa da aventura" />

    <Typography>{{ adventure.name }}</Typography>
  </div>
</template>
