<script setup lang="ts">
import { Button, InputField } from '@/components'
import { useInput } from '@/stores'
import { fieldRef } from '@/utils/functions'
import { storeToRefs } from 'pinia'
import { onBeforeUnmount, watch } from 'vue'

const { currentInput } = storeToRefs(useInput())

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

const rejectOnEscape = ({ key }: KeyboardEvent) => {
  if (key === 'Escape') currentInput.value?.reject?.()
}

window.addEventListener('keyup', rejectOnEscape)

onBeforeUnmount(() => window.removeEventListener('keyup', rejectOnEscape))
</script>

<template>
  <Transition name="transition">
    <div v-if="currentInput" @click.self="currentInput.reject" class="backdrop">
      <div class="input-getter">
        <!-- Close button -->
        <div
          v-if="currentInput.reject"
          @click="currentInput.reject"
          class="close"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </div>

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
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

#app .backdrop {
  z-index: 130;

  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;

  backdrop-filter: blur(3px);

  align-items: center;
  justify-content: center;

  @include high-contrast {
    background-color: black;
  }

  .input-getter {
    flex-direction: column;
    background-color: var(--main-lighter);
    padding: 1rem 1rem 1.5rem;
    border-radius: $border-radius;
    gap: 1rem;
    max-width: 92vw;
    max-height: 96vh;

    position: relative;

    @include bevel(var(--main-light));
    filter: drop-shadow(0 0 100px var(--bg-main-dark));

    .close {
      position: absolute;
      top: -1rem;
      right: -0.2rem;

      @include circle;
      background-color: var(--bg-main-light);
      color: var(--tx-main);

      cursor: pointer;
      font-size: 1.2rem;

      transition: 100ms;

      @include bevel(var(--main));

      &:hover {
        filter: brightness(1.02);
      }
    }

    .message-wrapper {
      display: inline;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: inherit;

      .input {
        filter: brightness(0.98);
        margin-top: 0.8rem;
      }
    }
  }
}

.transition-enter-active {
  &.backdrop {
    animation: backdrop-fade 300ms;

    .input-getter {
      animation: panel-slide 300ms;
    }
  }
}

.transition-leave-active {
  &.backdrop {
    animation: backdrop-fade 200ms reverse;

    .input-getter {
      animation: panel-slide 200ms reverse;
    }
  }
}

@keyframes backdrop-fade {
  from {
    backdrop-filter: blur(0);
  }

  to {
    backdrop-filter: blur(3px);
  }
}

@keyframes panel-slide {
  from {
    opacity: 0;
    transform: translateY(-5rem);
  }

  50% {
    opacity: 1;
    transform: translateY(0.8rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
