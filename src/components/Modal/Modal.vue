<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{ modelValue: boolean; hideCloseButton?: boolean }>()

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const closeOnEscape = ({ key }: KeyboardEvent) => {
  if (key === 'Escape') close()
}

window.addEventListener('keyup', closeOnEscape)

onBeforeUnmount(() => window.removeEventListener('keyup', closeOnEscape))
</script>

<template>
  <Transition name="transition">
    <div v-if="modelValue" @click.self="close" class="backdrop">
      <div class="modal" v-bind="$attrs">
        <!-- Close button -->
        <div v-if="!hideCloseButton" @click="close" class="close">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </div>

        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.backdrop {
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

  .modal {
    flex-direction: column;
    background-color: var(--main-lighter);
    border-radius: $border-radius;
    max-width: 92vw;
    max-height: 96vh;

    position: relative;

    @include bevel(var(--main-light));
    filter: drop-shadow(0 0 100px var(--bg-main-dark));

    .close {
      @include button;
      @include bevel(var(--main));
      @include circle;

      position: absolute;
      top: -1rem;
      right: -0.2rem;

      background-color: var(--bg-main-light);
      color: var(--tx-main);

      cursor: pointer;
      font-size: 1.2rem;

      transition: 100ms;
    }
  }
}

.transition-enter-active {
  &.backdrop {
    animation: backdrop-fade 300ms;

    .modal {
      animation: panel-slide 300ms;
    }
  }
}

.transition-leave-active {
  &.backdrop {
    animation: backdrop-fade 200ms reverse;

    .modal {
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
