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
  /** Retorna true se o modelValue inclui qualquer dessas palavras */
  const includesAny = (...words: string[]) =>
    words.reduce(
      (value, word) =>
        props.modelValue.name.toLowerCase().includes(word) || value,
      false
    )

  if (includesAny('password', 'senha')) return 'password'
  if (includesAny('color', 'cor')) return 'color'
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
    <label
      class="hint"
      :class="raiseLabel && 'raised'"
      :for="modelValue.name"
      >{{ splitCamelCase(modelValue.name) }}</label
    >
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

    <label class="error-message" :for="modelValue.name">
      {{ validationResult == true ? 'valido' : validationResult }}
    </label>
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

  .hint {
    margin-top: -0.5rem;

    transition: all 200ms;

    transform: translate(1rem, 1.6rem);

    color: var(--theme);
    font-weight: 600;

    height: 1.3rem;

    opacity: 0.6;
    cursor: pointer;

    .high-contrast & {
      opacity: 1;
    }
  }

  &:focus-within .hint,
  .hint.raised {
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

      .high-contrast & {
        opacity: 1;
      }
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

  .error-message {
    font-weight: 500;
    opacity: 0;
    cursor: pointer;

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
    .hint {
      color: var(--theme-tx-error);
      opacity: 1;
    }

    input,
    textarea,
    .color-display {
      border-color: var(--theme-tx-error);
      box-shadow: 0 2px 0 4px var(--theme-error);
      background-color: rgba(255, 0, 0, 0.2);

      .high-contrast & {
        background: none;
      }
    }

    .error-message {
      opacity: 1;
      margin-bottom: 0;
      font-size: 0.9rem;
    }
  }

  &.dark {
    --theme: var(--tx-white);
    // --theme-tx-error: var(--tx-error-darker);
  }

  &:hover {
    input,
    textarea,
    .color-display {
      background-color: var(--trans-3);
    }
  }
}
</style>
