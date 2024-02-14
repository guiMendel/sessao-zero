<script setup lang="ts">
import { Button, Modal } from '@/components'
import { Slider } from '@/components/Slider'
import { computed, ref } from 'vue'
import { useImageCropper } from '..'
import { useAcceptAndCancel } from './useAcceptAndCancel'
import { useCanvasResizer } from './useCanvasResizer'
import { useDrawOnCanvas } from './useDrawOnCanvas'
import { useFileAsImage } from './useFileAsImage'
import { usePan } from './usePan'

const {
  resolve,
  targetAspectRatio: aspectRatio,
  targetImage,
} = useImageCropper()

/** A imagem a ser recortada */
const image = ref<HTMLImageElement | null>(null)

/** Referencia ao pai do canvas */
const canvasContainer = ref<null | HTMLDivElement>(null)

/** Referencia ao canvas */
const canvas = ref<null | HTMLCanvasElement>(null)

/** Desocamento da imagem em relacao a posicao inical */
const pan = ref({ x: 0, y: 0 })

/** Proporcao do canvas que deve ser utilizado para visualizar o que nao
 * vai estar dentro da area de crop
 */
const cropPaddingProportion = ref(0.15)

const cropPadding = computed(() =>
  canvasContainer.value
    ? canvasContainer.value?.offsetWidth * cropPaddingProportion.value
    : 0
)

/** Zoom aplicado no editor. 1 eh sem zoom, 5 eh o maximo */
const zoom = ref(1)

/** Fornece um metodo para atualizar o canvas com os novos dados da imagem */
const { updateCanvas } = useDrawOnCanvas({
  canvas,
  cropPadding,
  image,
  pan,
  zoom,
})

/** Permite mover a imagem arrastando */
usePan({ canvas, pan, updateCanvas })

/** Gera uma URL e a insere no src da image a partir do file */
useFileAsImage(targetImage, image, { onImageLoad: updateCanvas })

/** Ajusta o tamanho do canvas para corresponder ao pai */
const { editorHeight, maxEditorWidth, recalculateCanvasSize } =
  useCanvasResizer({
    aspectRatio,
    canvas,
    updateCanvas,
    canvasContainer,
  })

/** Fornece metodos para aceitar a imagem e cancelar o crop */
const { accept, cancel } = useAcceptAndCancel({
  aspectRatio,
  canvas,
  cropPaddingProportion,
  recalculateCanvasSize,
  resolve,
  targetImage,
  updateCanvas,
})
</script>

<template>
  <Modal
    class="picture-cropper"
    :model-value="Boolean(targetImage)"
    @update:model-value="cancel"
    hide-close-button
  >
    <div
      class="canvas-container"
      ref="canvasContainer"
      :style="`--height: ${editorHeight}px; --max-width: ${
        maxEditorWidth ? maxEditorWidth + 'px' : 'unset'
      }`"
    >
      <canvas ref="canvas" width="100" height="100"></canvas>
    </div>

    <Slider v-model="zoom" :min="1" :max="8" class="zoom-slider" />

    <div class="actions">
      <Button @click="accept" variant="colored">aceitar</Button>

      <Button @click="cancel">cancelar</Button>
    </div>
  </Modal>
</template>

<style lang="scss">
@import '@/styles/variables.scss';

#app .picture-cropper {
  align-items: stretch;
  gap: 2rem;
  max-width: unset;
  width: 100vw;
  border-radius: 0;

  .canvas-container {
    height: var(--height);
    max-width: var(--max-width);

    canvas {
      width: 100%;
      height: 100%;
      // border-radius: $border-radius $border-radius 0 0;

      cursor: move;

      touch-action: none;
    }
  }

  .zoom-slider,
  .actions {
    margin-inline: 1rem;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.7rem;
    margin-bottom: 1rem;
  }
}
</style>
