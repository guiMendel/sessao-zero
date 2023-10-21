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
      password: inferred.type === 'password' && !multiline,
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

      <div class="input-area">
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
      </div>

      <!-- Opcao de revelar senha -->
      <IconButton
        class="password-reveal"
        @click="togglePasswordReveal"
        :icon="revealPassword ? 'eye' : 'eye-slash'"
      />
    </div>

    <!-- Mensagem de Erro -->
    <Typography
      variant="paragraph-secondary"
      class="error-message"
      :label-for="field.name"
    >
      {{ field.validationMessage }}
    </Typography>
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

    @include high-contrast-border;
    @include bevel(var(--main-light));

    border-radius: $border-radius;
    background-color: var(--main-lighter);

    padding: 0.3rem;

    .input-area {
      width: 100%;
      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;

      background-color: rgba(255, 255, 255, 0.5);
      left: var(--border);

      border-radius: calc($border-radius / 1);

      box-shadow: inset 0 1px 1px 1px var(--main-light);
    }

    .label {
      position: absolute;
      left: 1.3rem;
      top: 50%;

      translate: 0 -50%;

      transition: all 200ms;

      font-weight: 600;

      opacity: 0.7;
      color: var(--tx-main-dark);
      cursor: pointer;

      .high-contrast & {
        opacity: 1;
      }
    }

    &:focus-within .label,
    .label.raised {
      top: 0;
      left: 0;
      translate: 0 calc(-100% - 0.3rem);

      @include field-label;

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
      background: none;

      transition: all 200ms;

      &[type='password'] {
        font-size: 1.2rem;
        letter-spacing: 0.1rem;
      }
    }

    textarea {
      height: 7rem;
      resize: none;
    }

    .password-reveal {
      position: absolute;
      font-size: 1.2rem;
      right: 1.2rem;
      color: var(--tx-main);

      --shadow-color: var(--trans-03);

      display: none;
    }
  }

  .error-message {
    font-weight: 500;
    opacity: 0;
    cursor: pointer;
    max-width: 90%;
    max-height: 0;

    text-transform: lowercase;
    text-align: center;

    border-radius: 0 0 $border-radius $border-radius;
    background-color: var(--bg-error-washed);
    color: var(--bg-error);
    padding: 0 0.7rem 0.2rem;
    @include bevel(var(--error-lighter));

    margin: 0 auto 0;

    z-index: 10;

    transition: all 200ms;
  }

  &.error {
    .field {
      @include bevel(var(--error-lighter));
      background-color: var(--error-washed);

      .input-area {
        box-shadow: inset 0 1px 1px 1px var(--error-lighter);
      }
    }

    .label {
      opacity: 1;
      color: var(--tx-error);
    }

    input,
    textarea {
      background-color: rgba(255, 0, 0, 0.2);

      .high-contrast & {
        background: none;
      }
    }

    .error-message {
      opacity: 1;
      max-height: 3rem;
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
    filter: brightness(0.96);
  }
}
</style>
