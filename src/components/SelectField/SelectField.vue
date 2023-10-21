<script setup lang="ts" generic="T extends SelectOptionValueConstraints">
import {
  SelectOption,
  SelectOptionValueConstraints,
  getSelectOptionLabel,
  getSelectOptionValue,
  isSelectOptionDisabled,
  isSelectOptionHidden,
} from '@/utils'
import { getCurrentInstance } from 'vue'
import { Typography } from '..'

defineProps<{
  label?: string
  options: SelectOption<T>[]
  modelValue: T
  message?: string
}>()

const emit = defineEmits(['update:modelValue'])

const id = getCurrentInstance()?.uid.toString()

const setValue = ({ target }: Event) =>
  emit('update:modelValue', (target as HTMLInputElement).value)
</script>

<template>
  <div class="select-field">
    <Typography class="label" :label-for="id" v-if="label">
      {{ label }}
    </Typography>

    <div class="field">
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="down-icon" />

      <select class="select" :value="modelValue" @change="setValue" :id="id">
        <option
          v-for="option in options"
          :key="JSON.stringify(getSelectOptionValue(option))"
          :value="getSelectOptionValue(option)"
          :hidden="isSelectOptionHidden(option)"
          :disabled="isSelectOptionDisabled(option)"
        >
          {{ getSelectOptionLabel(option) }}
        </option>
      </select>
    </div>

    <Typography class="message" v-if="message">
      {{ message }}
    </Typography>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.select-field {
  flex-direction: column;
  align-items: stretch;
  gap: 0.3rem;

  .label {
    @include field-label;
  }

  .message {
    @include field-message;
  }

  .field {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 200ms;

    &:hover {
      filter: brightness(0.96);
    }

    .down-icon {
      position: absolute;
      right: 1rem;
      pointer-events: none;

      color: var(--main-dark);
    }

    .select {
      @include high-contrast-border;
      @include bevel(var(--main-light));

      width: 100%;

      display: flex;
      // Account for absolute positioned arrow on the right
      padding: 0.5rem 1rem;
      padding-right: 2rem;
      justify-content: space-between;
      align-items: center;
      background-color: var(--main-lighter);

      min-height: $field-height;

      border-radius: $border-radius;
      transition: all 200ms;

      text-align: left;

      // Remove default down arrow
      -moz-appearance: none; /* Firefox */
      -webkit-appearance: none; /* Safari and Chrome */
      appearance: none;
      cursor: pointer;
    }
  }
}
</style>
