<script setup lang="ts">
import { Typography } from '..'

withDefaults(
  defineProps<{
    /** Variante da aparencia do botao */
    variant?: 'default' | 'dark' | 'colored'
    message?: string
    messageClass?: string
  }>(),
  { variant: 'default' }
)
</script>

<template>
  <div class="button-wrapper">
    <button class="button" :class="variant"><slot></slot></button>

    <Typography class="message" :class="messageClass" v-if="message">
      {{ message }}
    </Typography>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.button-wrapper {
  flex-direction: column;
  gap: 0.3rem;

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
    }

    &.dark {
      background-color: var(--bg-trans-2);
    }

    &.colored {
      background-color: var(--bg-main-light);
      @include bevel(var(--bg-main));
      color: var(--tx-main-dark);
    }
  }

  .message {
    @include field-message;
  }
}
</style>
