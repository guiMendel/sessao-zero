<script setup lang="ts">
import { ButtonProps } from '..'

withDefaults(defineProps<ButtonProps>(), { variant: 'default' })
</script>

<template>
  <button class="button" :class="{ [variant]: true, disabled }">
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.button {
  @include button;

  min-width: 15rem;
  min-height: $field-height;
  font-weight: 800;

  display: flex;
  align-items: center;
  justify-content: center;

  &.default {
    background-color: var(--bg-trans-03);
    color: var(--tx-gray-darker);
  }

  &.dark {
    background-color: var(--bg-trans-2);
    color: var(--tx-gray-darker);
  }

  &.light {
    background-color: var(--bg-gray-lighter);
    color: var(--tx-gray-darker);
  }

  &.colored {
    background-color: var(--bg-main-light);
    color: var(--tx-main-dark);
    @include bevel(var(--bg-main));
  }

  &.disabled {
    @include disabled;
  }
}
</style>
