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
  <div class="toggle-field" @click="toggle">
    <Typography v-if="label != undefined">{{ label }}</Typography>

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
  gap: 1rem;

  .field {
    @include high-contrast-border;
    @include bevel(var(--main-light));

    border-radius: $border-radius;
    background-color: var(--main-lighter);
    padding: 0.5rem 1rem;
    align-items: center;
    justify-content: center;

    min-height: $field-height;

    .toggle {
      margin-left: auto;
    }
  }
}
</style>
