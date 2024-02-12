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
    <span class="initials">{{ initials }}</span>

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

  font-size: 1.6rem;
  align-items: center;
  justify-content: center;

  padding: 0.4rem;

  width: 2.9rem;
  height: 2.9rem;
  position: relative;

  &.background-main-lighter {
    background-color: var(--bg-main-lighter);
  }

  &.background-main-washed {
    background-color: var(--bg-main-washed);
  }

  &.background-gray-washed {
    background-color: var(--bg-gray-washed);
  }

  .initials {
    font-family: 'Lilita One', monospace;
  }

  .profile-icon {
    position: absolute;
    top: -0.3rem;
    right: -0.3rem;
    font-size: 1.2rem;
    color: var(--tx-main-dark);
  }
}
</style>
