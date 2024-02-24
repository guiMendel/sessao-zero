<script setup lang="ts" generic="T extends string">
import { usePrevious } from '@vueuse/core'
import { computed } from 'vue'
import { Typography } from '..'

const props = defineProps<{
  tabs: T[]
  modelValue: T
}>()

const emit = defineEmits(['update:modelValue'])

const select = (tab: T) => {
  if (tab !== props.modelValue) emit('update:modelValue', tab)
}

const selectedIndex = computed(() => props.tabs.indexOf(props.modelValue))

const previousIndex = usePrevious(selectedIndex)

// O valor para passar para o left do background de selecao
const selectionPosition = computed(
  () => `${(selectedIndex.value / props.tabs.length) * 100}%` as const
)

// A direcao para animar uma aba quando ele eh selecionada. Depende do indice anterior e do novo
const selectedDirection = computed(() => {
  if (
    previousIndex.value == undefined ||
    selectedIndex.value < previousIndex.value
  )
    return 'right'

  return 'left'
})

const transitionNameFor = (tab: T) => {
  const index = props.tabs.indexOf(tab)

  if (index < selectedIndex.value) return 'slide-right'
  if (index > selectedIndex.value) return 'slide-left'

  // Quando o indice eh o selecionado, depende da direcao da nova selecao
  return selectedTransition.value
}

const selectedTransition = computed(() => `slide-${selectedDirection.value}`)
</script>

<template>
  <div class="tabs">
    <div class="header" :class="`mode-${modelValue}`">
      <div class="tab" v-for="tab in tabs" :key="tab" @click="select(tab)">
        <slot :name="`${tab}:option`">
          <Typography
            class="default-text"
            :class="{ selected: modelValue === tab }"
            >{{ tab }}</Typography
          >
        </slot>
      </div>

      <div class="selection-border" :style="{ left: selectionPosition }"></div>
    </div>

    <div class="content">
      <Transition
        v-for="tab in tabs"
        :name="tab === modelValue ? selectedTransition : transitionNameFor(tab)"
        :key="tab"
      >
        <slot v-if="modelValue === tab" :name="modelValue"></slot>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.tabs {
  flex-direction: column;
  align-items: stretch;

  .header {
    align-items: stretch;
    border-bottom: 3px solid var(--tx-trans-1);
    position: relative;

    .tab {
      z-index: 10;
      flex: 1;
      padding-block: 0.5rem;
      color: var(--tx-trans-45);
      transition: all 200ms;
      font-weight: 500;
      text-align: center;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      border-radius: 6px 6px 0 0;

      &:hover {
        background-color: var(--trans-03);
      }

      @media (min-width: 700px) {
        padding-block: 0.8rem;

        .default-text {
          font-size: 1.1rem;
        }
      }

      .default-text {
        color: var(--tx-trans-45);
        transition: all 200ms;

        &.selected {
          color: var(--tx-main);
        }
      }
    }

    .selection-border {
      width: 50%;
      top: 0;
      left: 0;
      bottom: -3px;
      position: absolute;
      background-color: var(--bg-main-lighter);
      border-radius: 6px 6px 0 0;
      border-bottom: 3px solid var(--tx-main);
      transition: all 200ms ease-out;
      @include high-contrast-border;
    }
  }

  .content {
    flex-direction: column;
    align-items: stretch;
    position: relative;

    .slide-right-enter-active {
      position: absolute;
      left: 0;
      right: 0;
      animation: slide-right 200ms ease-in-out reverse;
    }

    .slide-right-leave-active {
      animation: slide-right 200ms ease-in-out;
    }

    .slide-left-enter-active {
      position: absolute;
      left: 0;
      right: 0;
      animation: slide-left 200ms ease-in-out reverse;
    }

    .slide-left-leave-active {
      animation: slide-left 200ms ease-in-out;
    }

    @keyframes slide-right {
      from {
        opacity: 1;
        translate: 0 0;
      }

      to {
        opacity: 0;
        translate: -60% 0;
      }
    }

    @keyframes slide-left {
      from {
        opacity: 1;
        translate: 0 0;
      }

      to {
        opacity: 0;
        translate: 60% 0;
      }
    }
  }
}
</style>
