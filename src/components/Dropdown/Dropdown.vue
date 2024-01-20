<script setup lang="ts">
defineProps<{ isOpen: boolean }>()
</script>

<template>
  <Transition name="draw">
    <div class="dropdown" v-if="isOpen">
      <slot></slot>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.dropdown {
  position: absolute;

  z-index: 20;

  background-color: var(--bg-main-washed);
  padding: 0.5rem;
  border-radius: $border-radius;
  @include high-contrast-border;
}

.draw-enter-active {
  animation: draw-animation 100ms ease-out;
}

.draw-leave-active {
  animation: draw-animation 100ms ease-in reverse;
}

@keyframes draw-animation {
  from {
    opacity: 0;
    translate: 0 20%;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
</style>
