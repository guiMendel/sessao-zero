<script setup lang="ts">
defineProps<{
  count: number
}>()
</script>

<template>
  <div v-if="count > 0" class="notifications-badge">
    {{ count }}
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.notifications-badge {
  position: absolute;
  left: -0.7rem;
  top: -0.3rem;

  background-color: var(--bg-warning);
  color: var(--tx-warning-darker);
  width: 1.2rem;
  height: 1.2rem;
  border-radius: $border-radius;
  align-items: center;
  justify-content: center;

  @include high-contrast-border;
  font-size: 0.7rem;
  font-weight: 900;
}
</style>
