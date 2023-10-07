<script lang="ts" setup>
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <Transition name="slide">
    <div
      class="shadow"
      v-if="modelValue"
      @click.self="emit('update:modelValue', false)"
    >
      <div class="panel" v-bind="$attrs">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.shadow {
  position: fixed;
  width: 100%;
  height: 100vh;
  backdrop-filter: blur(3px);
  z-index: 100;
  flex-direction: column;

  @include high-contrast {
    background-color: black;
  }

  .panel {
    background-color: var(--bg-main-washed);
    border-radius: 0 0 $border-radius $border-radius;
    padding: 4rem 1rem 3rem;
    margin-top: -2rem;

    box-shadow: 0 0 100px 0 var(--bg-main-dark);

    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    @include high-contrast-border;
  }
}

.slide-enter-active {
  &.shadow {
    animation: shadow-fade 300ms;

    .panel {
      animation: panel-slide 300ms;
    }
  }
}

.slide-leave-active {
  &.shadow {
    animation: shadow-fade 200ms reverse;

    .panel {
      animation: panel-slide 200ms reverse;
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
