<script setup lang="ts">
import { Credit, ToggleField, Typography } from '@/components'
import { useAccessibility } from '@/stores'
import { storeToRefs } from 'pinia'

const { highContrast } = storeToRefs(useAccessibility())
</script>

<template>
  <div class="configurations">
    <Typography class="heading" variant="subtitle">Acessibilidade</Typography>

    <ToggleField v-model="highContrast"
      ><Typography>alto contraste</Typography></ToggleField
    >

    <Credit class="credit" />
  </div>
</template>

<style lang="scss" scoped>
.configurations {
  width: 100%;
  max-width: 30rem;

  padding: 1.5rem 1.5rem 2rem;

  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  flex: 1;

  .heading {
    color: var(--tx-main-dark);
  }

  .credit {
    margin-top: auto;
  }
}
</style>
