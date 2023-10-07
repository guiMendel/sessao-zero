<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Icone para utilizar neste botao */
    icon: string
    /** Estilo do Font Awesome para aplicar */
    style?: 'fas' | 'far'
    /** Variante da aparencia do botao */
    variant?: 'plain'
    /** Alteram a cor do icone e de sua sombra */
    color?: 'default' | 'main-light'
  }>(),
  { style: 'fas', color: 'default' }
)
</script>

<template>
  <font-awesome-icon
    class="button-icon"
    :class="`color--${color}`"
    :icon="[style, icon]"
  />
</template>

<style scoped lang="scss">
@import '../../styles/variables.scss';

.button-icon {
  font-size: 0.9em;
  filter: drop-shadow(0 2px 0 var(--shadow-color));
  cursor: pointer;

  transition: all 100ms;

  &:hover {
    translate: 0 -1px;
    filter: drop-shadow(0 3px 0 var(--shadow-color));
  }

  &:active {
    translate: 0 1px;
    filter: drop-shadow(0 0 0 var(--shadow-color));
  }

  &.color {
    &--default {
      --shadow-color: var(--trans-3);
    }

    &--main-light {
      color: var(--tx-main-light);
      --shadow-color: var(--tx-main-lighter);
    }
  }
}
</style>
