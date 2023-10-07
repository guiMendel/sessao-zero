<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Variante da aparencia do botao */
    variant?: 'default' | 'colored'
  }>(),
  { variant: 'default' }
)
</script>

<template>
  <button class="button" :class="variant"><slot></slot></button>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.button {
  @include button;

  min-width: 6rem;
  font-weight: 800;

  &.default {
    background-color: var(--bg-trans-03);
  }

  &.colored {
    background-color: var(--bg-main-light);
    @include bevel(var(--bg-main));
    color: var(--tx-main-dark);
  }
}
</style>
