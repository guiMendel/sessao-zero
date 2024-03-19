<script setup lang="ts">
import { useGuildInvitation } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import { watch } from 'vue'
import { PlayerPanel } from './PlayerPanel'
import { useRouter } from 'vue-router'
import { useNavigationData } from '@/stores'

// Consome convites para guildas
const { consumeLink } = useGuildInvitation()
const { player } = useCurrentPlayer()
const { redirectToPreferredGuild } = useNavigationData()

const router = useRouter()

watch(
  player,
  (player) => {
    consumeLink()

    if (
      redirectToPreferredGuild.value &&
      player?.preferredGuildId &&
      router.currentRoute.value.name === 'home'
    )
      router.push({
        name: 'adventures',
        params: { guildId: player.preferredGuildId },
      })
  },
  { immediate: true }
)
</script>

<template>
  <div class="home">
    <PlayerPanel />

    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.home {
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  background-color: var(--bg-main-washed);

  @include high-contrast {
    background: none;
  }
}
</style>
