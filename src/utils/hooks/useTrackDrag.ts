import { ref } from 'vue'

type TrackDragOptions = {
  startCallback?: (point: { x: number; y: number }) => void
  endCallback?: (point: { x: number; y: number }) => void
}

/** Permite reagir ao arrastar do elemento fornecido
 * @param element O elemento a observar
 * @param movementCallback Callback para executar sempre que houver um movemento de arrastar neste elemento
 */
export const useTrackDrag =
  () =>
  (
    element: HTMLElement,
    movementCallback: (
      movement: { x: number; y: number },
      point: { x: number; y: number }
    ) => void,
    options?: TrackDragOptions
  ) => {
    /** Indica se o usuario esta arrastando */
    const isDragging = ref(false)

    // Sempre que soltar o mouse, para de arrastar
    const disableDragging = (event: MouseEvent) => {
      isDragging.value = false

      options?.endCallback?.({ x: event.clientX, y: event.clientY })
    }

    // Quando clicar comeca a arrastar
    const startDragging = (event: MouseEvent) => {
      isDragging.value = true

      options?.startCallback?.({ x: event.clientX, y: event.clientY })
    }

    // Sempre que mover o mouse
    const moveIfDragging = (event: MouseEvent) => {
      if (isDragging.value == false) return

      movementCallback(
        { x: event.movementX, y: event.movementY },
        { x: event.clientX, y: event.clientY }
      )
    }

    /** Guarda a posicao da ultima ocorrencia de touch */
    let lastTouchPositon: null | { x: number; y: number } = null

    const touchStart = (event: TouchEvent) => {
      const touch = event.touches[0]

      lastTouchPositon = { x: touch.clientX, y: touch.clientY }

      options?.startCallback?.(lastTouchPositon)
    }

    const touchPan = (event: TouchEvent) => {
      const touch = event.touches[0]

      if (lastTouchPositon == null) return

      movementCallback(
        {
          x: touch.clientX - lastTouchPositon.x,
          y: touch.clientY - lastTouchPositon.y,
        },
        { x: touch.clientX, y: touch.clientY }
      )

      lastTouchPositon = { x: touch.clientX, y: touch.clientY }
    }

    const touchEnd = (event: TouchEvent) => {
      lastTouchPositon = null

      if (options?.endCallback) {
        const touch = event.touches[0]

        options.endCallback({ x: touch.clientX, y: touch.clientY })
      }
    }

    element.addEventListener('mousedown', startDragging)
    window.addEventListener('mouseup', disableDragging)
    window.addEventListener('mousemove', moveIfDragging)

    element.addEventListener('touchstart', touchStart)
    window.addEventListener('touchend', touchEnd)
    window.addEventListener('touchmove', touchPan)

    // Clean up
    let cleanedUp = false

    return () => {
      if (cleanedUp) return

      element.removeEventListener('touchstart', touchStart)
      window.removeEventListener('mouseup', disableDragging)
      element.removeEventListener('mousedown', startDragging)
      window.removeEventListener('mousemove', moveIfDragging)
      window.removeEventListener('touchend', touchEnd)
      window.removeEventListener('touchmove', touchPan)

      cleanedUp = true
    }
  }
