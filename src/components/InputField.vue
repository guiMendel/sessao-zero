<script setup lang="ts">
import { computed, ref } from 'vue'
import { Field } from '../types/Field.interface'
import { splitCamelCase } from '../utils'

const props = defineProps<{
  modelValue: Field
  multiline?: boolean
  variant?: 'dark'
}>()

const emit = defineEmits(['update:modelValue'])

const handleInput = (event: Event) => {
  const newValue = (event.target as HTMLInputElement).value

  const newValid =
    props.modelValue.validate != undefined
      ? props.modelValue.validate(newValue) === true
      : true

  emit('update:modelValue', {
    ...props.modelValue,
    value: newValue,
    valid: newValid,
  })
}

// Whether to show errors
const showErrors = ref(false)

const validationResult = computed(() =>
  props.modelValue.validate != undefined
    ? props.modelValue.validate(props.modelValue.value)
    : true
)

// Shows any error messages
const errorMessage = computed(() =>
  validationResult.value !== true && showErrors.value
    ? validationResult.value
    : ''
)

// Initialize valid field
if (props.modelValue.valid != validationResult.value)
  emit('update:modelValue', {
    ...props.modelValue,
    valid: validationResult.value === true,
  })

// Infer type from name
const inferredType = computed(() => {
  if (props.modelValue.name.toLowerCase().includes('password'))
    return 'password'
  if (props.modelValue.name.toLowerCase().includes('color')) return 'color'
  return 'text'
})

// Should the label be raised
const raiseLabel = computed(
  () =>
    props.multiline ||
    props.modelValue.value != '' ||
    inferredType.value == 'color'
)
</script>

<template>
  <div
    class="input-field"
    :class="{ error: errorMessage != '', dark: props.variant === 'dark' }"
    @focusout="showErrors = true"
  >
    <label :class="raiseLabel && 'raised'" :for="modelValue.name">{{
      splitCamelCase(modelValue.name)
    }}</label>
    <textarea
      v-if="multiline && inferredType != 'color'"
      :type="inferredType"
      :id="modelValue.name"
      v-bind="$attrs"
      :value="modelValue.value"
      @input="handleInput"
    ></textarea>

    <input
      v-else
      :type="inferredType"
      :id="modelValue.name"
      v-bind="$attrs"
      :value="modelValue.value"
      @input="handleInput"
      :style="inferredType == 'color' && 'display: none'"
    />

    <label
      v-if="inferredType == 'color'"
      :for="modelValue.name"
      :style="{ backgroundColor: modelValue.value }"
      class="color-display"
    >
      <!-- <font-awesome-icon :icon="['fas', 'palette']" /> -->
    </label>

    <small class="error">{{ validationResult }}</small>
  </div>
</template>

<style scoped lang="scss">
@import '../styles/variables.scss';

.input-field {
  flex-direction: column;
  width: 12rem;

  --theme: var(--tx-main);
  --theme-tx-error: var(--tx-error);
  --theme-error: var(--error);
  --border: 2px solid var(--theme);

  @media (min-width: 768px) {
    width: 30rem;
  }

  label {
    margin-top: -0.5rem;
    
    transition: all 200ms;

    transform: translate(1rem, 1.6rem);

    color: var(--theme);
    font-weight: 600;

    height: 1.3rem;

    opacity: 0.6;
  }

  &:focus-within label,
  label.raised {
    transform: translateY(0);
    font-size: 0.8rem;

    opacity: 1;
  }

  input,
  textarea,
  .color-display {
    font-weight: 600;
    cursor: pointer;

    width: 100%;

    padding-block: 0.3rem;

    transition: all 200ms;

    &::placeholder {
      opacity: 0.4;
    }
  }

  textarea {
    height: 7rem;
    resize: vertical;

    padding-inline: 0.5rem;

    border-radius: var(--border-radius);
  }

  .color-display {
    margin-top: -1.5rem;
    margin-bottom: 1.5rem;

    padding: 0 0.5rem;
    height: 2rem;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-radius: var(--border-radius);

    // box-shadow: 0 0 3px 2px rgba(68, 68, 68, 0.1);

    > * {
      color: var(--tx-gray-dark);
    }
  }

  small {
    font-weight: 500;
    opacity: 0;

    text-transform: lowercase;
    text-align: center;

    margin: 0 auto;

    background-color: var(--theme-error);
    color: var(--theme);
    border-radius: 0 0 $border-radius $border-radius;
    padding: 0.2rem 1rem;

    margin-bottom: -1rem;

    transition: all 200ms;
  }

  &.error {
    label {
      color: var(--theme-tx-error);
      opacity: 1;
    }

    input {
      border-color: var(--theme-tx-error);
      box-shadow: 0 2px 0 4px var(--theme-error);
    }

    small {
      opacity: 1;
      // margin-top: 0.7rem;
      margin-bottom: 0;
    }
  }

  &.dark {
    --theme: var(--tx-white);
    // --theme-tx-error: var(--tx-error-darker);
  }
}
</style>
