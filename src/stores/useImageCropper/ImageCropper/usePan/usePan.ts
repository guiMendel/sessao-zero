import { useTrackDrag } from '@/utils/hooks'
import { Ref, onBeforeUnmount, watch } from 'vue'

type PanParams = {
  canvas: Ref<HTMLCanvasElement | null>
  pan: Ref<{
    x: number
    y: number
  }>
  updateCanvas: VoidFunction
}

export const usePan = ({ canvas, pan, updateCanvas }: PanParams) => {
  /** Prepara a funcao de reagir ao arraste */
  const trackElement = useTrackDrag()

  /** Vai guardar o callback de finalizar o observer */
  let stopTracking: (() => void) | null = null

  watch(canvas, (canvas) => {
    stopTracking?.()

    // Se nao houver canvas
    if (canvas == null) {
      // Verifica se necessita parar os observers
      stopTracking = null

      return
    }

    // Se houver canvas
    stopTracking = trackElement(canvas, ({ x, y }) => {
      // Atualiza o pan
      pan.value.x += x
      pan.value.y += y

      // Atualiza o canvas
      updateCanvas()
    })
  })

  onBeforeUnmount(() => stopTracking?.())
}
