<script setup lang="ts">
import { Button, InputField, Modal } from '@/components'
import { Fields } from '@/components/Fields'
import { useInput } from '@/stores'
import { fieldRef } from '@/utils/functions'
import { computed, onBeforeUnmount, watch } from 'vue'

const { currentInput } = useInput()

const cancel = () => currentInput.value?.resolve(currentInput.value.cancelValue)

const cancelOnEscape = ({ key }: KeyboardEvent) => {
  if (key === 'Escape') cancel()
}

window.addEventListener('keyup', cancelOnEscape)

onBeforeUnmount(() => window.removeEventListener('keyup', cancelOnEscape))

// =================================================
// BOOLEAN TYPE
// =================================================

const submitBoolean = (value: boolean) => {
  if (currentInput.value?.getter.type !== 'boolean') return

  if (currentInput.value.getter.onSubmit)
    currentInput.value.getter.onSubmit(value, currentInput.value.resolve)
  else currentInput.value.resolve(value)
}

// =================================================
// FIELDS TYPE
// =================================================

const fieldsAreValid = computed<boolean>(() => {
  if (currentInput.value?.getter.type !== 'fields') return false

  return currentInput.value.getter.fields.every(
    (field) => field.validate(field.value) === true
  )
})

const submitFields = () => {
  if (currentInput.value?.getter.type !== 'fields' || !fieldsAreValid.value)
    return

  const fields = currentInput.value.getter.fields.reduce(
    (fields, field) => ({ ...fields, [field.name]: field.value }),
    {} as Record<string, any>
  )

  if (currentInput.value.getter.onSubmit)
    currentInput.value.getter.onSubmit(fields, currentInput.value.resolve)
  else currentInput.value.resolve(fields)
}

// =================================================
// STRING TYPE
// =================================================

const stringFields = {
  string: fieldRef<string>('resposta', {
    initialValue: '',
  }),
}

// Sempre que vier um tipo stirng, atualiza o campo
watch(currentInput, (currentInput) => {
  if (currentInput?.getter.type !== 'string') return

  stringFields.string.name = currentInput.getter.inputFieldName ?? 'resposta'
  stringFields.string.validate = currentInput.getter.validator ?? (() => true)
  stringFields.string.value = currentInput.getter.initialValue ?? ''
})

const submitString = () => {
  if (
    currentInput.value?.getter.type !== 'string' ||
    stringFields.string.validate(stringFields.string.value) !== true
  )
    return

  if (currentInput.value.getter.onSubmit)
    currentInput.value.getter.onSubmit(
      stringFields.string.value,
      currentInput.value.resolve
    )
  else currentInput.value.resolve(stringFields.string.value)
}
</script>

<template>
  <Modal
    :model-value="Boolean(currentInput)"
    @update:model-value="cancel"
    :hide-close-button="currentInput?.cancelValue === undefined"
    class="input-getter"
  >
    <template v-if="currentInput">
      <!-- Message -->
      <div
        v-html="currentInput.getter.messageHtml"
        class="message-wrapper"
        :class="currentInput.getter.messageClass"
      ></div>

      <!-- BOOLEAN TYPE -->
      <template v-if="currentInput.getter.type === 'boolean'">
        <!-- true -->
        <Button
          @click="submitBoolean(true)"
          v-bind="currentInput.getter.trueButton?.buttonProps"
        >
          {{ currentInput.getter.trueButton?.label ?? 'Sim' }}
        </Button>

        <!-- false -->
        <Button
          @click="submitBoolean(false)"
          v-bind="currentInput.getter.falseButton?.buttonProps"
        >
          {{ currentInput.getter.falseButton?.label ?? 'Não' }}
        </Button>
      </template>

      <!-- STRING TYPE -->
      <form
        v-else-if="currentInput.getter.type === 'string'"
        @submit.prevent="submitString"
      >
        <!-- Input -->
        <InputField :field="stringFields.string" class="input" auto-focus />

        <!-- Confirma -->
        <Button
          v-bind="currentInput.getter.submitButton?.buttonProps"
          :disabled="
            stringFields.string.validate(stringFields.string.value) != true
          "
        >
          {{ currentInput.getter.submitButton?.label ?? 'Enviar' }}
        </Button>
      </form>

      <!-- FIELDS TYPE -->
      <form
        v-else-if="currentInput.getter.type === 'fields'"
        @submit.prevent="submitFields"
      >
        <!-- Fields -->
        <Fields
          :fields="currentInput.getter.fields"
          :auto-focus="currentInput.getter.autoFocus"
          class="fields"
        />

        <!-- Confirma -->
        <Button
          v-bind="currentInput.getter.submitButton?.buttonProps"
          :disabled="!fieldsAreValid"
        >
          {{ currentInput.getter.submitButton?.label ?? 'enviar' }}
        </Button>
      </form>
    </template>
  </Modal>
</template>

<style lang="scss">
@import '@/styles/variables.scss';

#app .input-getter {
  padding: 1rem 1rem 1.5rem;
  gap: 1rem;

  .message-wrapper {
    display: inline;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: inherit;

    .input {
      filter: brightness(0.98);
    }

    .fields {
      flex-direction: column;
      gap: 1.5rem;
      align-items: stretch;
    }
  }
}
</style>
