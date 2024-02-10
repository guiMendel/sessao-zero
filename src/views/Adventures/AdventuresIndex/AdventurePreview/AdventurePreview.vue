<script setup lang="ts">
import { Vase } from '@/api'
import { Typography } from '@/components'
import { Resource } from '@/firevase/resources'

defineProps<{ adventure: Resource<Vase, 'adventures'> }>()
</script>

<template>
  <Typography>{{ adventure.name }}</Typography>
</template>
