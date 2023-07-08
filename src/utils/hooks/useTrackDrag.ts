import { onBeforeUnmount, ref } from 'vue'

/** Permite reagir ao arrastar do elemento fornecido
 * @param element O elemento a observar
 * @param movementCallback Callback para executar sempre que houver um movemento de arrastar neste elemento
 */
export function useTrackDrag(
  element: HTMLElement,
  movementCallback: (
    movement: { x: number; y: number },
    point: { x: number; y: number }
  ) => void,
  startCallback?: (point: { x: number; y: number }) => void,
  endCallback?: (point: { x: number; y: number }) => void
) {
  /** Indica se o usuario esta arrastando */
  const isDragging = ref(false)

  // Sempre que soltar o mouse, para de arrastar
  const disableDragging = (event: MouseEvent) => {
    isDragging.value = false

    if (endCallback) endCallback({ x: event.clientX, y: event.clientY })
  }

  // Quando clicar comeca a arrastar
  const startDragging = (event: MouseEvent) => {
    isDragging.value = true

    if (startCallback) startCallback({ x: event.clientX, y: event.clientY })
  }

  // Sempre que mover o mouse
  function moveIfDragging(event: MouseEvent) {
    if (isDragging.value == false) return

    movementCallback(
      { x: event.movementX, y: event.movementY },
      { x: event.clientX, y: event.clientY }
    )
  }

  /** Guarda a posicao da ultima ocorrencia de touch */
  let lastTouchPositon: null | { x: number; y: number } = null

  function touchStart(event: TouchEvent) {
    const touch = event.touches[0]

    lastTouchPositon = { x: touch.clientX, y: touch.clientY }

    if (startCallback) startCallback(lastTouchPositon)
  }

  function touchPan(event: TouchEvent) {
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

  function touchEnd(event: TouchEvent) {
    lastTouchPositon = null

    if (endCallback) {
      const touch = event.touches[0]

      endCallback({ x: touch.clientX, y: touch.clientY })
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

  onBeforeUnmount(() => {
    if (cleanedUp) return

    element.removeEventListener('touchstart', touchStart)
    window.removeEventListener('mouseup', disableDragging)
    element.removeEventListener('mousedown', startDragging)
    window.removeEventListener('mousemove', moveIfDragging)
    window.removeEventListener('touchend', touchEnd)
    window.removeEventListener('touchmove', touchPan)

    cleanedUp = true
  })
}
