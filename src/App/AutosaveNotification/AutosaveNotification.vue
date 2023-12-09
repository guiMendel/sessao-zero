<script setup lang="ts">
import { LoadingSpinner, Typography } from '@/components'
import { AutosaveStatus, useAutosaveStatus } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const { status } = storeToRefs(useAutosaveStatus())

const statusMap: Record<
  AutosaveStatus,
  undefined | { copy: string; color: string; background: string }
> = {
  idle: undefined,
  persisting: {
    copy: 'salvando alterações',
    color: 'white',
    background: 'gray-light',
  },
  retrying: {
    copy: 'falhou: tentando novamente',
    color: 'error-washed',
    background: 'error-light',
  },
  success: {
    copy: 'alterações salvas',
    color: 'main',
    background: 'main-lighter',
  },
}

const style = computed(() =>
  statusMap[status.value]
    ? {
        color: `var(--tx-${statusMap[status.value]!.color})`,
        backgroundColor: `var(--bg-${statusMap[status.value]!.background})`,
      }
    : undefined
)
</script>

<template>
  <div v-if="statusMap[status]" :style="style" class="autosave-notification">
    <LoadingSpinner
      v-if="status != AutosaveStatus.Success"
      color="current-color"
      class="spinner"
    />

    <font-awesome-icon v-else :icon="['fas', 'champagne-glasses']" />

    <Typography class="text">{{ statusMap[status]!.copy }}</Typography>
  </div>
</template>

<style lang="scss" scoped>
.autosave-notification {
  z-index: 100;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;

  .spinner {
    font-size: 1.05rem;
  }

  .text {
    font-weight: 500;
  }
}
</style>
