<script setup lang="ts">
import { useTrackDrag } from '@/utils/hooks'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  /** O valor a ser sincronizado */
  modelValue: number

  /** Valor minimo */
  min: number

  /** Valor maximo */
  max: number
}>()

const emit = defineEmits(['update:modelValue'])

const clampValue = (value: number) =>
  Math.min(Math.max(value, props.min), props.max)

const setValue = (value: number) => emit('update:modelValue', clampValue(value))

// Ja garante que o valor inicial esta bom
setValue(props.modelValue)

// === OBSERVAR ARRASTE

/** Referencia ao handle */
const handle = ref<HTMLDivElement | null>(null)

/** Referencia ao slider */
const slider = ref<HTMLDivElement | null>(null)

const valueRange = props.max - props.min

/** Pega obsever de arraste */
const trackElement = useTrackDrag()

/** Permite limpar o observer */
let stopTracking: ReturnType<typeof trackElement> | null = null

/** Converte posicao em pixel para proporcao de valor */
const getValueProportion = (pixelPosition: number) => {
  if (!slider.value?.offsetWidth) return 0

  return (pixelPosition * valueRange) / slider.value.offsetWidth
}

watch(slider, (slider) => {
  stopTracking?.()
  stopTracking = null

  if (slider == null) return

  stopTracking = trackElement(
    slider,
    (_, { x: pixelDisplacement }) => {
      if (slider == null) return

      // Acha o deslocamento de valor proporcional ao tamanho do slider
      const sliderStartingX = slider.getBoundingClientRect().left

      const startPosition =
        getValueProportion(pixelDisplacement - sliderStartingX) + props.min

      setValue(startPosition)
    },
    {
      startCallback: ({ x: startPositionPixels }) => {
        if (slider == null) return

        /** Posicao X em que comeca o slider */
        const sliderStartingX = slider.getBoundingClientRect().left

        const startPosition =
          getValueProportion(startPositionPixels - sliderStartingX) + props.min

        setValue(startPosition)
      },
    }
  )
})

onBeforeUnmount(() => stopTracking?.())

// === FRACAO DO VALOR

const valuePercentage = computed(
  () => `${((props.modelValue - props.min) * 100) / valueRange}%`
)
</script>

<template>
  <div class="range-slider" ref="slider">
    <div class="filled track"></div>
    <div class="empty track"></div>
    <div class="handle" ref="handle"></div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.range-slider {
  min-width: 5rem;

  position: relative;

  align-items: center;
  justify-content: center;

  touch-action: none;

  cursor: pointer;

  .track {
    height: 0.5rem;
    position: absolute;

    border-radius: 1rem;

    &.filled {
      left: 0;

      width: v-bind(valuePercentage);
      background-color: var(--tx-main);
    }

    &.empty {
      right: 0;

      width: calc(100% - v-bind(valuePercentage));
      background-color: var(--trans-45);
    }
  }

  .handle {
    @include circle;

    position: absolute;

    left: v-bind(valuePercentage);
    transform: translateX(-50%);

    background-color: var(--tx-main-light);
    width: 1.3rem;
    height: 1.3rem;

    border: 0.3rem solid var(--tx-main);
  }
}
</style>
