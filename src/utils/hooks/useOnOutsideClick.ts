import { onBeforeUnmount } from 'vue'

/** Esta funcao recebe um elemento HTML, e passa a executar o callback sempre que houver um clique fora dele
 *
 * @returns Um callback que quando executado remove o listener
 */
export function useOnOutsideClick(element: HTMLElement, callback: () => void) {
  /** Funcao auxiliar que, dado um evento de clique, verifica se ele foi fora do elemento. Se sim, executa o callback */
  function detectOutsideClick(event: MouseEvent) {
    if (
      event.target != null &&
      element != null &&
      element.contains(event.target as Node) == false &&
      element != (event.target as Node)
    )
      callback()
  }

  // Adiciona o listener
  window.addEventListener('click', detectOutsideClick)

  // Clean up
  onBeforeUnmount(() => window.removeEventListener('click', detectOutsideClick))
}
