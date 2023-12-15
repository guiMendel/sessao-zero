<script setup lang="ts">
import { computed } from 'vue'
import { ButtonProps, Typography } from '..'

const props = withDefaults(defineProps<ButtonProps>(), { variant: 'default' })

const computedClass = computed(() => ({
  [props.variant]: true,
  disabled: props.disabled,
}))
</script>

<template>
  <div class="button-wrapper" :class="computedClass">
    <button class="button" :class="computedClass">
      <slot></slot>
    </button>

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

  &.default {
    color: var(--tx-gray-darker);
  }

  &.dark {
    color: var(--tx-gray-darker);
  }

  &.colored {
    color: var(--tx-main-dark);
  }

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
    }

    &.disabled {
      @include disabled;
    }
  }

  .message {
    @include field-message;
  }
}
</style>
