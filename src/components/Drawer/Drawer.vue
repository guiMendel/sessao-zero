<script lang="ts" setup>
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    modelValue: boolean
    drawDirection: 'top' | 'bottom'
  }>(),
  { drawDirection: 'top' }
)

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <Transition name="slide">
    <div
      class="shadow"
      v-if="modelValue"
      @click.self="emit('update:modelValue', false)"
    >
      <div
        class="panel"
        :class="`draw-direction-${drawDirection}`"
        v-bind="$attrs"
      >
        <slot></slot>
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
    position: absolute;
    left: 0;
    right: 0;
    background-color: var(--bg-main-washed);
    padding-inline: 1rem;

    box-shadow: 0 0 100px 0 var(--bg-main-dark);

    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    @include high-contrast-border;

    &.draw-direction-top {
      top: -2rem;
      border-radius: 0 0 $border-radius $border-radius;
      padding-block: 4rem 3rem;
    }

    &.draw-direction-bottom {
      bottom: -2rem;
      border-radius: $border-radius $border-radius 0 0;
      padding-block: 3rem 4rem;
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
