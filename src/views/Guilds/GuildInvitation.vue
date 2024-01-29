<script setup lang="ts">
import { useGuildInvitation } from '@/api/guilds'
import { LoadingSpinner } from '@/components'
import { useRouter } from 'vue-router'

const router = useRouter()

const { storeLink, consumeLink } = useGuildInvitation()

// Guarda o link e vai para home
storeLink()

// Se conseguir ja consumir imediatamente, otimo!
consumeLink()

router.push({ name: 'home' })
</script>

<template>
  <LoadingSpinner />
</template>
