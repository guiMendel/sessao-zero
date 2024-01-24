<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { reactive, ref, watch } from 'vue';
import { DropdownProps } from '.';

const props = withDefaults(defineProps<DropdownProps>(), {
  align: 'right',
  marginX: 0,
  marginY: 0,
})

watch(props, ({ isOpen }) => {
  if (isOpen) handleOpen()
})

/** Distancia do ponto de ancora do dropdown ate os limites da tela */
const boundingDistances = reactive({ x: 99999, y: 99999 })

/** O dropdown em si */
const dropdown = ref<HTMLDivElement | null>(null)

/** Box do container que limita o dropdown */
// const containerBox = useContainerBox(computed(() => props.boundingContainer))

/** Margem a aplicar quando ajeitar o dropdown para dentro da tela */
const adjustmentMargin = 10

/** O estilo a ser aplicado */
const position: {
  top?: number
  bottom?: number
  left?: number
  right?: number
} = reactive({})

const getContainerBox = () =>
  props.boundingContainer?.getBoundingClientRect() ?? {
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
    left: 0,
  }

const handleOpen = () => {
  const { anchor } = props

  if (!anchor) return

  const anchorBox = anchor.getBoundingClientRect()

  position.bottom = undefined
  position.left = undefined
  position.right = undefined

  // Posiciona o dropdown
  position.top = anchorBox.bottom + props.marginY
  position[props.align] =
    (props.align == 'left'
      ? anchorBox.left
      : window.innerWidth - anchorBox.right) + props.marginX

  const containerBox = getContainerBox()

  boundingDistances.y = containerBox.bottom - position.top
  boundingDistances.x = containerBox.right - position[props.align]!

  adjustIntoScreen()
}

const adjustIntoScreen = () => {
  if (!dropdown.value) return

  const { width, height } = dropdown.value.getBoundingClientRect()

  console.log({
    width,
    height,
    screenDistances: `${boundingDistances.x}, ${boundingDistances.y}`,
  })

  // Adjust vertically
  if (height > boundingDistances.y) {
    const containerBox = getContainerBox()

    position.top = undefined
    position.bottom =
      window.innerHeight - containerBox.bottom + adjustmentMargin
  }

  // Adjust horizontally
  if (width > boundingDistances.x) {
    const containerBox = getContainerBox()

    position.left = undefined
    position.right = undefined

    position[props.align == 'left' ? 'right' : 'left'] =
      (props.align == 'left'
        ? window.innerWidth - containerBox.right
        : containerBox.left) + adjustmentMargin
  }
}

useResizeObserver(dropdown, adjustIntoScreen)
</script>

<template>
  <Transition name="draw">
    <div
      ref="dropdown"
      class="dropdown"
      v-if="isOpen"
      :style="{
        top: position.top ? `${position.top}px` : 'unset',
        left: position.left ? `${position.left}px` : 'unset',
        right: position.right ? `${position.right}px` : 'unset',
        bottom: position.bottom ? `${position.bottom}px` : 'unset',
      }"
    >
      <slot></slot>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.dropdown {
  position: fixed;

  z-index: 20;

  background-color: var(--bg-main-washed);
  padding: 0.5rem;
  border-radius: $border-radius / 2;
  @include high-contrast-border;

  opacity: 0.9;

  box-shadow: 0 0.1rem 2px 0 var(--trans-1);

  min-width: max-content;

  box-sizing: border-box;
}

.draw-enter-active {
  animation: draw-animation 100ms ease-out;
}

.draw-leave-active {
  animation: draw-animation 100ms ease-in reverse;
}

@keyframes draw-animation {
  from {
    opacity: 0;
    translate: 0 20%;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}
</style>
