/** Permite armazenar callbacks para cleanup e fornece um meio de executar cleanups com antecedencia */
export class CleanupManager {
  private nextId = 0

  private managedCleanups: Record<number, () => void> = {}

  private disposeListeners: Array<() => void> = []

  /** Registra esse callback para cleanup
   * @returns um metodo que, se executado, invoca o callback e remove o callback deste manager
   */
  add(callback: () => void) {
    const callbackId = this.nextId++

    this.managedCleanups[callbackId] = callback

    return () => {
      callback()
      delete this.managedCleanups[callbackId]
    }
  }

  /** Realiza o cleanup dos callbacks armazenados */
  dispose() {
    for (const callback of Object.values(this.managedCleanups)) callback()

    for (const callback of this.disposeListeners) callback()

    this.managedCleanups = {}
  }

  /** Executa esse callback sempre que realizar um dispose */
  onDispose(callback: () => void) {
    this.disposeListeners.push(callback)
  }
}
