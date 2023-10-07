<script lang="ts" setup>
import { Typography } from '..'
</script>

<template>
  <Typography class="credit"
    >feito com <font-awesome-icon :icon="['fas', 'heart']" /> por Gui
    Mendel</Typography
  >
</template>

<style lang="scss" scoped>
.credit {
  color: var(--tx-main);
  align-items: center;
  justify-content: center;

  svg {
    margin-inline: 0.3rem;
  }
}
</style>
