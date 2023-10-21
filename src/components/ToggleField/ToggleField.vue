<script setup lang="ts">
import { Typography } from '..'
import { Toggle } from '../Toggle'

const props = defineProps<{
  modelValue: boolean
  label?: string
}>()

const emit = defineEmits(['update:modelValue'])

const toggle = () => emit('update:modelValue', !props.modelValue)
</script>

<template>
  <div class="toggle-field" :class="modelValue && 'enabled'" @click="toggle">
    <Typography class="label" v-if="label != undefined">{{ label }}</Typography>

    <div class="field">
      <slot></slot>

      <Toggle class="toggle" :model-value="modelValue" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.toggle-field {
  flex-direction: column;
  align-items: stretch;
  gap: 0.3rem;
  cursor: pointer;

  .label {
    color: var(--tx-primary);

    font-weight: 600;
    font-size: 0.9rem;
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
