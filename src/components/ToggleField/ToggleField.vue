<script setup lang="ts">
import { Typography } from '..'
import { Toggle } from '../Toggle'

const props = defineProps<{
  modelValue: boolean
  label?: string
  message?: string
}>()

const emit = defineEmits(['update:modelValue'])

const toggle = () => emit('update:modelValue', !props.modelValue)
</script>

<template>
  <div class="toggle-field" :class="modelValue && 'enabled'">
    <Typography @click="toggle" class="label" v-if="label != undefined">{{
      label
    }}</Typography>

    <div class="field" @click="toggle">
      <slot></slot>

      <Toggle class="toggle" :model-value="modelValue" />
    </div>

    <Typography class="message" v-if="message">
      {{ message }}
    </Typography>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.toggle-field {
  flex-direction: column;
  align-items: stretch;
  gap: 0.3rem;

  .label {
    @include field-label;
  cursor: pointer;
  }

  .message {
    @include field-message;
  }

  .field {
    @include high-contrast-border;
    @include bevel(var(--gray-light));

    border-radius: $border-radius;
    background-color: var(--gray-lighter);
    padding: 0.5rem 1rem;
    align-items: center;
    justify-content: center;

    min-height: $field-height;
    transition: all 200ms;
    cursor: pointer;

    &:hover {
      filter: brightness(0.96);
    }

    .toggle {
      margin-left: auto;
    }
  }

  &.enabled {
    .field {
      background-color: var(--main-lighter);
      @include bevel(var(--main-light));
    }
  }
}
</style>
