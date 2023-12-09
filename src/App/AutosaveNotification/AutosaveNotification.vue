<script setup lang="ts">
import { LoadingSpinner, Typography } from '@/components'
import { AutosaveStatus, useAutosaveStatus } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'

const { status: rawStatus } = storeToRefs(useAutosaveStatus())

/** O mesmo que rawStatus, mas espera um delay antes de mostrar o Persisting */
const status = ref(rawStatus.value)

/** O timeout do delay de status */
let delayTimeout: NodeJS.Timeout | undefined = undefined

watch(rawStatus, (rawStatus) => {
  if (rawStatus != AutosaveStatus.Persisting) {
    status.value = rawStatus

    if (delayTimeout) clearTimeout(delayTimeout)
    delayTimeout = undefined
  } else {
    if (delayTimeout == undefined)
      delayTimeout = setTimeout(() => {
        status.value = rawStatus
      }, 1000)
  }
})

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
  <Transition name="draw">
    <div v-if="statusMap[status]" :style="style" class="autosave-notification">
      <LoadingSpinner
        v-if="status != AutosaveStatus.Success"
        color="current-color"
        class="spinner"
      />

      <font-awesome-icon v-else :icon="['fas', 'champagne-glasses']" />

      <Typography class="text">{{ statusMap[status]!.copy }}</Typography>
    </div>
  </Transition>
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

  transition: all 200ms;

  .spinner {
    font-size: 1.05rem;
  }

  .text {
    font-weight: 500;
  }
}

.draw-enter-active {
  animation: draw-animation 300ms ease-out;
}

.draw-leave-active {
  animation: draw-animation 300ms ease-in reverse;
}

@keyframes draw-animation {
  from {
    opacity: 0;
    translate: 0 50%;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
</style>
