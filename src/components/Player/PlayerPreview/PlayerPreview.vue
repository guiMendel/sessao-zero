<script setup lang="ts">
import { Vase } from '@/api'
import { LoadingSpinner, Typography } from '@/components'
import { Resource } from '@/firevase/resources'
import { useRouter } from 'vue-router'
import { ProfilePicture } from '..'

const props = withDefaults(
  defineProps<{
    player: Resource<Vase, 'players'> | undefined
    background?: 'none' | 'main'
    profileIcon?: string
    showProfileButton?: boolean
  }>(),
  { background: 'none', showProfileButton: true }
)

const router = useRouter()

const openProfilePage = () =>
  props.player &&
  router.push({ name: 'player', params: { playerId: props.player.id } })
</script>

<template>
  <div
    class="player-preview"
    :class="`background-${background}`"
    @click="openProfilePage"
  >
    <LoadingSpinner v-if="!player" />

    <template v-else>
      <!-- Profile picture -->
      <ProfilePicture
        :background="background === 'main' ? 'main-washed' : 'main-lighter'"
        :player="player"
        :profile-icon="profileIcon"
      />

      <div class="text">
        <!-- Nome -->
        <Typography class="name">{{ player.name }}</Typography>

        <!-- Apelido -->
        <Typography variant="paragraph-secondary" class="nickname"
          >@{{ player.nickname }}</Typography
        >
      </div>

      <div v-if="showProfileButton" class="see-profile">
        <Typography variant="paragraph-secondary">perfil</Typography>

        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.player-preview {
  align-items: center;
  gap: 1rem;

  &.background-main {
    background-color: var(--bg-main-lighter);
    border-radius: $border-radius;
    padding: 0.5rem;
    @include bevel(var(--main-light));
  }

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
