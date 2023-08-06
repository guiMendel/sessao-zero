<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconButton } from '..'
import { Field } from '@/types/Field.interface'
import { splitCamelCase } from '@/utils'

const props = defineProps<{
  modelValue: Field
  autoFocus?: boolean
  multiline?: boolean
  variant?: 'dark'
}>()

const emit = defineEmits(['update:modelValue'])

// ================================
// INPUT HANDLING
// ================================

/** Lida com cada input do usuario */
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

// ================================
// ERROR HANDLING
// ================================

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

// ================================
// AUTO FOCUS
// ================================

/** Tem a ref do campo que esta sendo utilizado */
const fieldRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

// Sempre que esse ref mudar
watch(fieldRef, (fieldRef) => {
  // Se nao houver campo ignora
  if (fieldRef == null) return

  // Se auto focus estiver ligado, foca
  if (props.autoFocus) fieldRef.focus()
})

// ================================
// PASSWORD REVEAL
// ================================

/** Infere o tipo a partir do nome */
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

/** Se deve revelar a senha */
const revealPassword = ref(false)

/** Qual tipo deve ser utilizado no campo */
const fieldType = computed((): (typeof inferredType)['value'] => {
  if (inferredType.value === 'password' && revealPassword.value) return 'text'

  return inferredType.value
})

/** Revela a senha e foca no input */
const togglePasswordReveal = () => {
  revealPassword.value = !revealPassword.value

  if (fieldRef.value == undefined) return

  // Foca no input e coloca o cursor no fim do texto
  fieldRef.value.focus()

  setTimeout(() => {
    if (fieldRef.value == undefined) return
    fieldRef.value.selectionStart = 100000
  }, 0)
}

// ================================
// OTHER
// ================================

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
    :class="{
      error: errorMessage != '',
      dark: props.variant === 'dark',
      password: inferredType === 'password',
    }"
    @focusout="showErrors = true"
  >
    <div class="field">
      <!-- Nome do Campo -->
      <label
        class="hint"
        :class="raiseLabel && 'raised'"
        :for="modelValue.name"
        >{{ splitCamelCase(modelValue.name) }}</label
      >

      <textarea
        v-if="multiline && fieldType != 'color'"
        :type="fieldType"
        :id="modelValue.name"
        v-bind="$attrs"
        :value="modelValue.value"
        @input="handleInput"
        ref="fieldRef"
      ></textarea>

      <input
        v-else
        :type="fieldType"
        :id="modelValue.name"
        v-bind="$attrs"
        :value="modelValue.value"
        @input="handleInput"
        :style="fieldType == 'color' && 'display: none'"
        ref="fieldRef"
      />

      <!-- Input de Cor -->
      <label
        v-if="fieldType == 'color'"
        :for="modelValue.name"
        :style="{ backgroundColor: modelValue.value }"
        class="color-display"
      >
        <!-- <font-awesome-icon :icon="['fas', 'palette']" /> -->
      </label>

      <!-- Opcao de revelar senha -->
      <IconButton
        class="password-reveal"
        @click="togglePasswordReveal"
        :icon="revealPassword ? 'eye-slash' : 'eye'"
      />
    </div>

    <!-- Mensagem de Erro -->
    <label class="error-message" :for="modelValue.name">
      {{ validationResult == true ? 'valido' : validationResult }}
    </label>
  </div>
</template>

<style scoped lang="scss">
@import '../../styles/variables.scss';

.input-field {
  flex-direction: column;
  width: 12rem;
  padding-top: 0.6rem;

  --theme: var(--tx-main);
  --theme-tx-error: var(--tx-error);
  --theme-error: var(--error);
  --border: 2px solid var(--theme);

  @media (min-width: 768px) {
    width: 30rem;
  }

  .field {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .hint {
      position: absolute;
      left: 0.5rem;

      transition: all 200ms;

      font-weight: 600;
      color: var(--theme);

      opacity: 0.6;
      cursor: pointer;

      .high-contrast & {
        opacity: 1;
      }
    }

    &:focus-within .hint,
    .hint.raised {
      translate: 0 -1.7rem;

      font-size: 0.9rem;

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

      background-color: var(--trans-03);
      box-shadow: 0 2px 0 4px var(--theme);

      &::placeholder {
        opacity: 0.4;

        .high-contrast & {
          opacity: 1;
        }
      }

      &[type='password'] {
        font-size: 1.2rem;
        letter-spacing: 0.1rem;
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

    .password-reveal {
      position: absolute;
      font-size: 1.2rem;
      right: 0.5rem;

      display: none;
    }
  }

  .error-message {
    font-weight: 500;
    opacity: 0;
    cursor: pointer;
    max-width: 90%;

    text-transform: lowercase;
    text-align: center;

    margin: 0 auto;

    background-color: var(--theme-error);
    color: var(--tx-white);
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
    color: var(--tx-white);
  }

  &.password {
    .password-reveal {
      display: initial;
    }

    input,
    textarea {
      padding-right: 2.2rem;
    }
  }

  &:hover {
    input,
    textarea,
    .color-display {
      background-color: var(--trans-1);
    }
  }
}
</style>
