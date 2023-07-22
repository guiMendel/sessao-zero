<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    style?: string
    variant?: 'plain'
  }>(),
  { style: 'fas' }
)
</script>

<template>
  <font-awesome-icon class="button-icon" :icon="[style, icon]" />
</template>

<style scoped lang="scss">
@import '../styles/variables.scss';

.button-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 0 var(--trans-3));
  cursor: pointer;

  transition: all 100ms;

  &:hover {
    translate: 0 -1px;
    filter: drop-shadow(0 3px 0 var(--trans-3));
  }

  &:active {
    translate: 0 1px;
    filter: drop-shadow(0 0 0 var(--trans-3));
  }
}
</style>
