<script setup lang="ts">
import { FullInstance, isMember, useCurrentPlayer } from '@/api'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  guild: FullInstance<'guilds'>
}>()

const { player } = storeToRefs(useCurrentPlayer())

const playerIsMember = computed(() => isMember(player.value, props.guild))
</script>

<template>
  <div v-if="playerIsMember === false" class="join-guild-prompt">Join now!</div>
</template>
