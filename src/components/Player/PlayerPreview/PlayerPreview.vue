<script setup lang="ts">
import { FullInstance } from '@/api/resources'
import { Typography } from '@/components'
import { useRouter } from 'vue-router'
import { ProfilePicture } from '..'

const props = defineProps<{
  player: FullInstance<'players'>
}>()

const router = useRouter()

const openProfilePage = () =>
  router.push({ name: 'player', params: { playerId: props.player.id } })
</script>

<template>
  <div class="player-preview" @click="openProfilePage">
    <!-- Profile picture -->
    <ProfilePicture :player="player" />

    <div class="text">
      <!-- Nome -->
      <Typography class="name">{{ player.name }}</Typography>

      <!-- Apelido -->
      <Typography variant="paragraph-secondary" class="nickname"
        >@{{ player.nickname }}</Typography
      >
    </div>

    <div class="see-profile">
      <Typography variant="paragraph-secondary">perfil</Typography>

      <font-awesome-icon :icon="['fas', 'chevron-right']" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.player-preview {
  align-items: center;
  gap: 1rem;

  .text {
    flex-direction: column;

    .name {
      font-weight: 500;
      color: var(--tx-main-dark);
    }

    .nickname {
      color: var(--tx-main-dark);
      opacity: 0.7;
    }
  }

  .see-profile {
    color: var(--tx-main);
    gap: 0.5rem;
    align-items: center;
    margin-left: auto;

    background-color: var(--bg-main-lighter);
    padding: 0.3rem 0.8rem;
    border-radius: $border-radius;

    svg {
      font-size: 0.7rem;
    }
  }
}
</style>
@/utils/types
