<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue'

/** Mapeia um indice ao dado correspondente */
const diceMap = [
  'fa-dice-one',
  'fa-dice-two',
  'fa-dice-three',
  'fa-dice-four',
  'fa-dice-five',
  'fa-dice-six',
] as const

/** O indice atual */
const index = ref(0)

/** O dado atual */
const dice = computed(() => diceMap[index.value])

// Avanca o indice
const intervalKey = setInterval(
  () => (index.value = (index.value + 1) % diceMap.length),
  500
)

// Cleanup
onBeforeUnmount(() => clearInterval(intervalKey))
</script>

<template>
  <div class="spinner">
    <font-awesome-icon class="loading-spinner" :icon="['fas', dice]" />
  </div>
</template>

<style lang="scss" scoped>
.spinner {
  animation: spin 1s ease-in-out infinite alternate,
    change-hue 1.5s linear infinite;
  color: hsl(118, 100%, 50%);
  background-color: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  width: min-content;
  padding: 0.01em 0.08em;
  border-radius: 0.2em;
  font-size: 1.2em;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(450deg);
  }
}

@keyframes change-hue {
  from {
    filter: hue-rotate(0deg);
  }

  to {
    filter: hue-rotate(360deg);
  }
}
</style>
