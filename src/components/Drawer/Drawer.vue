<script lang="ts" setup>
import { Button } from '..'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    modelValue: boolean
    drawDirection?: 'top' | 'bottom'
    preferedSide?: 'right' | 'left'
  }>(),
  { drawDirection: 'top', preferedSide: 'right' }
)

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)
</script>

<template>
  <Transition name="slide">
    <div class="shadow" v-if="modelValue" @click.self="close">
      <div
        class="panel"
        :class="`draw-direction-${drawDirection} preferred-side-${preferedSide}`"
      >
        <Button class="close-button" @click="close">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </Button>

        <div class="content" v-bind="$attrs">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.shadow {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  backdrop-filter: blur(3px);
  z-index: 100;
  flex-direction: column;

  @include high-contrast {
    background-color: black;
  }

  .panel {
    $limit: 30rem;

    position: absolute;
    background-color: var(--bg-main-washed);
    border-block: 1rem solid var(--tx-main-lighter);

    box-shadow: 0 0 100px 0 var(--bg-main-dark);

    width: 100%;
    max-width: $limit;

    @include high-contrast-border;

    &.preferred-side-right {
      right: 0;
    }

    &.preferred-side-left {
      left: 0;
    }

    &.draw-direction-top {
      top: -2rem;
      border-radius: 0 0 $border-radius $border-radius;

      &.preferred-side-right {
        @media (min-width: $limit) {
          border-radius: 0 0 0 $border-radius;
        }
      }

      &.preferred-side-left {
        @media (min-width: $limit) {
          border-radius: 0 0 $border-radius 0;
        }
      }

      .content {
        padding-block: 4rem 3rem;
      }

      .close-button {
        bottom: -4rem;
      }
    }

    &.draw-direction-bottom {
      bottom: -2rem;
      border-radius: $border-radius $border-radius 0 0;

      &.preferred-side-right {
        @media (min-width: $limit) {
          border-radius: $border-radius 0 0 0;
        }
      }

      &.preferred-side-left {
        @media (min-width: $limit) {
          border-radius: 0 $border-radius 0 0;
        }
      }

      .content {
        padding-block: 3rem 4rem;
      }

      .close-button {
        top: -4rem;
      }
    }

    .close-button {
      position: absolute;
      left: 50%;
      translate: -50% 0;

      z-index: 200;

      padding: 0;
      min-width: unset;
      min-height: unset;
      width: 2rem;
      height: 2rem;
      color: var(--tx-main-dark);

      background-color: var(--bg-main-lighter);
      @include bevel(var(--main-light));
    }

    .content {
      max-height: 90vh;
      overflow: auto;
      padding-inline: 1rem;
      min-width: 100%;

      flex-direction: column;
      align-items: stretch;
      gap: 1.5rem;
    }
  }
}

.slide-enter-active {
  &.shadow {
    animation: shadow-fade 300ms;

    .panel.draw-direction-top {
      animation: panel-slide-top 300ms;
    }

    .panel.draw-direction-bottom {
      animation: panel-slide-bottom 300ms;
    }
  }
}

.slide-leave-active {
  &.shadow {
    animation: shadow-fade 200ms reverse;

    .panel.draw-direction-top {
      animation: panel-slide-top 200ms reverse;
    }

    .panel.draw-direction-bottom {
      animation: panel-slide-bottom 200ms reverse;
    }
  }
}

@keyframes shadow-fade {
  from {
    backdrop-filter: blur(0);
  }

  to {
    backdrop-filter: blur(3px);
  }
}

@keyframes panel-slide-top {
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

@keyframes panel-slide-bottom {
  from {
    opacity: 0;
    transform: translateY(5rem);
  }

  50% {
    opacity: 1;
    transform: translateY(-0.8rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
