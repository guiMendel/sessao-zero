<script setup lang="ts">
import { StyleValue } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Variante de texto, impacta sobretudo o tamanho */
    variant?: 'paragraph' | 'paragraph-secondary' | 'title' | 'subtitle'
    color?: 'gray-darker' | 'white'
    /** Useful when setting as=label */
    labelFor?: string
  }>(),
  { color: 'gray-darker', variant: 'paragraph', as: 'p' }
)

const style: StyleValue = {
  color: `var(--tx-${props.color})`,
}
</script>

<template>
  <component
    :is="labelFor ? 'label' : 'p'"
    :class="props.variant"
    :style="style"
    :for="labelFor"
    ><slot></slot
  ></component>
</template>

<style scoped lang="scss">
@import '../../styles/variables.scss';

p {
  color: v-bind(color);

  &.paragraph {
    font-size: 1rem;
  }

  &.paragraph-secondary {
    font-size: 0.8rem;
  }

  &.title {
    font-size: 2rem;
    font-family: 'Patua One', cursive;
    font-weight: bold;
  }

  &.subtitle {
    font-size: 1.5rem;
    font-family: 'Patua One', cursive;
    font-weight: 400;
  }
}
</style>
