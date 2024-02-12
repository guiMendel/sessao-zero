<script setup lang="ts">
import { Vase } from '@/api'
import { LoadingSpinner, Typography } from '@/components'
import { Resource } from '@/firevase/resources'
import { useRouter } from 'vue-router'
import { ProfilePicture } from '..'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    player: Resource<Vase, 'players'> | undefined
    showUndefinedAsEmpty?: boolean
    background?: 'none' | 'main'
    profileIcon?: string
  }>(),
  { background: 'none' }
)

const router = useRouter()

const openProfilePage = () =>
  props.player &&
  router.push({ name: 'player', params: { playerId: props.player.id } })

const pictureBackground = computed(() => {
  if (!props.player && props.showUndefinedAsEmpty) return 'gray-washed'

  if (props.background === 'main') return 'main-washed'

  return 'main-lighter'
})
</script>

<template>
  <div
    class="player-preview"
    :class="{
      [`background-${background}`]: true,
      empty: !player && showUndefinedAsEmpty,
    }"
    @click="openProfilePage"
  >
    <LoadingSpinner v-if="!player && !showUndefinedAsEmpty" />

    <template v-else>
      <!-- Profile picture -->
      <ProfilePicture
        :background="pictureBackground"
        :player="player"
        :profile-icon="profileIcon"
      />

      <div class="text">
        <template v-if="player">
          <!-- Nome -->
          <Typography class="name">{{ player.name }}</Typography>

          <!-- Apelido -->
          <Typography variant="paragraph-secondary" class="nickname"
            >@{{ player.nickname }}</Typography
          >
        </template>

        <Typography v-else class="empty-player">vazio</Typography>
      </div>

      <slot></slot>
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

    &.empty {
      background-color: var(--bg-gray-lighter);
      @include bevel(var(--gray-light));
    }
  }

  &.empty {
    color: var(--tx-gray-dark);
  }

  .text {
    flex-direction: column;
    text-align: left;

    .name {
      font-weight: 500;
      color: var(--tx-main-dark);
    }

    .nickname {
      color: var(--tx-main-dark);
      opacity: 0.7;
    }

    .empty-player {
      font-style: italic;
    }
  }
}
</style>
