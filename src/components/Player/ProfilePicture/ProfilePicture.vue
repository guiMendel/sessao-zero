<script setup lang="ts">
import { Player } from '@/api/players'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    player: Player | undefined
    background: 'main-lighter' | 'main-washed' | 'gray-washed'
    profileIcon?: string
  }>(),
  { background: 'main-lighter' }
)

// Get initials from name
const initials = computed(
  () =>
    props.player?.name
      .split(' ')
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join('') ?? ''
)
</script>

<template>
  <div class="portrait" :class="`background-${background}`">
    <div v-if="player?.oauthProfilePicture" class="image-container">
      <img :src="player.oauthProfilePicture" alt="foto de perfil" />
    </div>

    <span v-else class="initials">{{ initials }}</span>

    <!-- Icon -->
    <font-awesome-icon
      class="profile-icon"
      v-if="profileIcon"
      :icon="['fas', profileIcon]"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.portrait {
  color: var(--tx-main);

  @include high-contrast-border;

  border-radius: 50%;

  align-items: center;
  justify-content: center;

  padding: 0.3em;

  width: 2.9em;
  height: 2.9em;
  position: relative;

  &.background-main-lighter {
    background-color: var(--bg-main-lighter);
    filter: brightness(1.04);
  }

  &.background-main-washed {
    background-color: var(--bg-main-washed);
  }

  &.background-gray-washed {
    background-color: var(--bg-gray-washed);
  }

  .image-container {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }

    &::after {
      content: '';
      box-shadow: inset 0 1px 1px 1px var(--main-light);
      position: absolute;
      border-radius: 50%;

      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      z-index: 10;
    }
  }

  .initials {
    font-family: 'Lilita One', monospace;
    font-size: 1.6em;
  }

  .profile-icon {
    position: absolute;
    top: -0.3em;
    right: -0.3em;
    font-size: 1.2em;
    color: var(--tx-main-dark);
    z-index: 20;
  }
}
</style>
