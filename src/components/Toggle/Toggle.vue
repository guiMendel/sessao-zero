<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="toggle" :class="{ active: modelValue }">
    <font-awesome-icon :icon="['fas', 'check']" class="check" />
    <div class="knob"></div>
    <font-awesome-icon :icon="['fas', 'xmark']" class="xmark" />
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.toggle {
  --padding: 0.2em;
  --size: 1.1em;
  --track-proportion: 2.2;

  width: calc(var(--track-proportion) * var(--size));
  height: var(--size);
  box-sizing: content-box;
  padding: var(--padding);
  border-radius: $border-radius;

  position: relative;
  background-color: var(--bg-gray-light);
  align-items: center;
  transition: all 200ms;

  @include high-contrast-border;

  .knob {
    position: absolute;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background-color: var(--tx-gray-lighter);
    transition: all 200ms;
    z-index: 10;

    left: var(--padding);
  }

  .check {
    width: var(--size);
    position: absolute;
    left: calc(var(--padding) + (var(--track-proportion) - 2) * var(--size) / 2);

    color: var(--tx-main-washed);
    opacity: 0;
    transition: all 200ms;
  }

  .xmark {
    width: var(--size);
    position: absolute;
    right: calc(var(--padding) + (var(--track-proportion) - 2) * var(--size) / 2);

    color: var(--tx-gray-dark);
    transition: all 200ms;
  }

  &.active {
    background-color: var(--bg-main-light);

    .knob {
      left: 100%;
      transform: translateX(calc(-100% - var(--padding)));
      background-color: var(--tx-main-washed);
    }

    .check {
      opacity: 1;
    }

    .xmark {
      opacity: 0;
    }
  }
}
</style>
