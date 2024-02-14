<script setup lang="ts">
import { Button, InputField, Modal } from '@/components'
import { useInput } from '@/stores'
import { fieldRef } from '@/utils/functions'
import { onBeforeUnmount, watch } from 'vue'

const { currentInput } = useInput()

const fields = {
  string: fieldRef<string>('resposta', {
    initialValue: '',
  }),
}

// Sempre que vier um tipo stirng, atualiza o campo
watch(currentInput, (currentInput) => {
  if (currentInput?.getter.type !== 'string') return

  fields.string.name = currentInput.getter.inputFieldName ?? 'resposta'
  fields.string.validate = currentInput.getter.validator ?? (() => true)
  fields.string.value = currentInput.getter.initialValue ?? ''
})

const submitString = () => {
  if (fields.string.validate(fields.string.value) === true)
    currentInput.value!.resolve(fields.string.value)
}

const cancel = () => currentInput.value?.resolve(currentInput.value.cancelValue)

const cancelOnEscape = ({ key }: KeyboardEvent) => {
  if (key === 'Escape') cancel()
}

window.addEventListener('keyup', cancelOnEscape)

onBeforeUnmount(() => window.removeEventListener('keyup', cancelOnEscape))
</script>

<template>
  <Modal
    :model-value="Boolean(currentInput)"
    @update:model-value="cancel"
    :hide-close-button="currentInput?.cancelValue == undefined"
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
          @click="currentInput.resolve(true)"
          v-bind="currentInput.getter.trueButton?.buttonProps"
        >
          {{ currentInput.getter.trueButton?.label ?? 'Sim' }}
        </Button>

        <!-- false -->
        <Button
          @click="currentInput.resolve(false)"
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
        <InputField :field="fields.string" class="input" auto-focus />

        <!-- Confirma -->
        <Button
          v-bind="currentInput.getter.submitButton?.buttonProps"
          :disabled="fields.string.validate(fields.string.value) != true"
        >
          {{ currentInput.getter.submitButton?.label ?? 'Enviar' }}
        </Button>
      </form>
    </template>
  </Modal>
</template>

<style lang="scss">
@import '@/styles/variables.scss';

#app .input-getter {
  padding: 1rem 1rem 1.5rem;

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
  }
}
</style>
