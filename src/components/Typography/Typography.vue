<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Variante de texto, impacta sobretudo o tamanho */
    variant?: 'paragraph' | 'paragraph-secondary' | 'title' | 'subtitle'
    /** Useful when setting as=label */
    labelFor?: string
  }>(),
  { variant: 'paragraph' }
)
</script>

<template>
  <component
    :is="labelFor ? 'label' : 'p'"
    :class="`${props.variant} typography`"
    :for="labelFor"
    ><slot></slot
  ></component>
</template>

<style scoped lang="scss">
@import '../../styles/variables.scss';

p,
label {
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
