<script setup lang="ts">
import { FieldRef, splitCamelCase } from '@/utils'
import { computed, ref, watch } from 'vue'
import { IconButton, Typography } from '..'
import { inferFieldProperties } from './inferFieldProperties'

const props = defineProps<{
  field: FieldRef
  autoFocus?: boolean
  multiline?: boolean
  autocomplete?: HTMLInputElement['autocomplete']
}>()

// ================================
// FIELD PROPERTIES
// ================================

/** Infere o tipo e o autocomplete a partir do nome */
const inferred = computed(() => inferFieldProperties(props.field.name))

// ================================
// INPUT HANDLING
// ================================

/** Lida com cada input do usuario */
const handleInput = (event: Event) =>
  (props.field.value = (event.target as HTMLInputElement).value)

// ================================
// ERROR HANDLING
// ================================

// Whether to show errors
const showErrors = ref(false)

// ================================
// AUTO FOCUS
// ================================

/** Tem a ref do campo que esta sendo utilizado */
const fieldElement = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

// Sempre que esse ref mudar
watch(fieldElement, (fieldElement) => {
  // Se nao houver campo ignora
  if (fieldElement == null) return

  // Se auto focus estiver ligado, foca
  if (props.autoFocus) fieldElement.focus()
})

// ================================
// PASSWORD REVEAL
// ================================

/** Se deve revelar a senha */
const revealPassword = ref(false)

/** Qual tipo deve ser utilizado no campo */
const fieldType = computed(() => {
  if (inferred.value.type === 'password' && revealPassword.value) return 'text'

  return inferred.value.type
})

/** Revela a senha e foca no input */
const togglePasswordReveal = () => {
  revealPassword.value = !revealPassword.value

  if (fieldElement.value == undefined) return

  // Foca no input e coloca o cursor no fim do texto
  fieldElement.value.focus()

  setTimeout(() => {
    if (fieldElement.value == undefined) return
    fieldElement.value.selectionStart = 100000
  }, 0)
}

// ================================
// OTHER
// ================================

/** Valor a ser utilizado de autocomplete */
const autocompleteValue = computed(
  () => props.autocomplete ?? inferred.value.autocomplete
)

/** Se a label deveria estar levantada */
const raiseLabel = computed(
  () =>
    props.multiline || props.field.value != '' || inferred.value.type == 'color'
)
</script>

<template>
  <div
    class="input-field"
    :class="{
      error: field.valid == false,
      password: inferred.type === 'password',
    }"
    @focusout="showErrors = true"
  >
    <div class="field">
      <!-- Nome do Campo -->
      <Typography
        class="label"
        :class="raiseLabel && 'raised'"
        :label-for="field.name"
        >{{ splitCamelCase(inferred.display ?? field.name) }}</Typography
      >

      <textarea
        v-if="multiline && fieldType != 'color'"
        :id="field.name"
        :name="field.name"
        v-bind="$attrs"
        :value="field.value"
        @input="handleInput"
        ref="fieldElement"
        :autocomplete="autocompleteValue"
      ></textarea>

      <input
        v-else
        :type="fieldType"
        :id="field.name"
        :name="field.name"
        v-bind="$attrs"
        :value="field.value"
        @input="handleInput"
        :style="fieldType == 'color' && 'display: none'"
        ref="fieldElement"
        :autocomplete="autocompleteValue"
      />

      <!-- Opcao de revelar senha -->
      <IconButton
        class="password-reveal"
        @click="togglePasswordReveal"
        :icon="revealPassword ? 'eye' : 'eye-slash'"
      />
    </div>

    <!-- Mensagem de Erro -->
    <label class="error-message" :for="field.name">
      {{ field.validationMessage }}
    </label>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.input-field {
  flex-direction: column;
  align-items: stretch;
  min-width: 8rem;
  width: 100%;
  margin-top: 1.3rem;

  .field {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;

    .label {
      position: absolute;
      left: 0.5rem;
      top: 50%;

      translate: 0 -50%;

      transition: all 200ms;

      font-weight: 600;

      opacity: 0.6;
      cursor: pointer;

      .high-contrast & {
        opacity: 1;
      }
    }

    &:focus-within .label,
    .label.raised {
      top: 0;
      translate: -0.5rem calc(-100% - 0.3rem);

      font-size: 0.9rem;

      opacity: 1;
    }

    input,
    textarea {
      font-weight: 600;
      cursor: pointer;

      width: 100%;

      padding: 0.5rem 1rem;
      border-radius: $border-radius;
      min-height: $field-height;

      display: flex;
      align-items: center;

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
      resize: none;

      padding-inline: 0.5rem;
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
    .label {
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
@/utils/types/Field
