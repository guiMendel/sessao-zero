import { Ref, onBeforeUnmount, ref, watch } from 'vue'

type CanvasResizerParams = {
  aspectRatio: Ref<[number, number]>
  canvas: Ref<null | HTMLCanvasElement>
  updateCanvas: VoidFunction
  canvasContainer: Ref<HTMLDivElement | null>
}

/** Ajusta o tamanho do canvas para corresponder ao pai */
export const useCanvasResizer = ({
  aspectRatio,
  canvas,
  updateCanvas,
  canvasContainer,
}: CanvasResizerParams) => {
  /** Guarda a altura do canvas container */
  const editorHeight = ref(10)

  /** Guarda a largura (se nulo, nao altera nada) */
  const maxEditorWidth = ref<undefined | number>(undefined)

  /** Altura maxima do editor */
  const getMaxHeight = () => window.innerHeight * 0.7

  /** Calcula a largura maxima baseada na altura maxima */
  const calculateMaxWidth = () => {
    if (aspectRatio.value == undefined || aspectRatio.value[1] == 0) {
      maxEditorWidth.value = undefined

      return
    }

    maxEditorWidth.value =
      (aspectRatio.value[0] * getMaxHeight()) / aspectRatio.value[1]
  }

  // Sempre que mudar o aspect ratio
  watch(aspectRatio, calculateMaxWidth)

  window.addEventListener('resize', calculateMaxWidth)

  onBeforeUnmount(() => window.removeEventListener('resize', calculateMaxWidth))

  const recalculateCanvasSize = () => {
    if (canvasContainer.value == undefined || canvas.value == undefined) return

    // Recalcula a altura do container
    if (aspectRatio.value == undefined || aspectRatio.value[0] == 0) {
      editorHeight.value = 10
    } else {
      editorHeight.value =
        (aspectRatio.value[1] * canvasContainer.value.offsetWidth) /
        aspectRatio.value[0]
    }

    // Atualizar o tamanho do canvas
    canvas.value.width = canvas.value.offsetWidth
    canvas.value.height = canvas.value.offsetHeight

    // Atualizar o canvas
    updateCanvas()
  }

  const resizeObserver = new ResizeObserver(recalculateCanvasSize)

  watch(canvasContainer, (targetValue) => {
    if (targetValue == null) resizeObserver.disconnect()
    else resizeObserver.observe(targetValue)
  })

  return { editorHeight, maxEditorWidth, recalculateCanvasSize }
}
