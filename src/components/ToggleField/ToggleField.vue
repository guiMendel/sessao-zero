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
  <div class="toggle-field prebaked-field-wrapper" @click="toggle">
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
  .field {
    .toggle {
      margin-left: auto;
    }
  }
}
</style>
