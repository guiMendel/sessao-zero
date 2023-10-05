<script setup lang="ts">
import { Player } from '@/types';
import { computed } from 'vue';

const props = defineProps<{ player: Player }>()

// Get initials from name
const initials = computed(() =>
  props.player.name
    .split(' ')
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('')
)
</script>

<template>
  <div class="portrait">
    <span class="initials">{{ initials }}</span>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.portrait {
  background-color: var(--bg-main-lighter);
  color: var(--tx-main);

  @include high-contrast-border;

  border-radius: 50%;

  font-size: 1.6rem;
  align-items: center;
  justify-content: center;

  padding: 0.4rem;

  .initials {
    font-family: 'Lilita One', monospace;
  }

  aspect-ratio: 1/1;
}
</style>
