<script setup lang="ts">
import { isMember } from '@/api/resourcePaths/guilds'
import { useCurrentPlayer } from '@/api/resourcePaths/players'
import { FullInstance } from '@/api/resources'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  guild: FullInstance<'guilds'>
}>()

const { player } = storeToRefs(useCurrentPlayer())

console.log({ player })

const playerIsMember = computed(() => isMember(player.value, props.guild))
</script>

<template>
  <div v-if="playerIsMember === false" class="join-guild-prompt">Join now!</div>
</template>
