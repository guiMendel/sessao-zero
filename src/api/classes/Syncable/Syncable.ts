import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
  onSnapshot,
} from 'firebase/firestore'
import { CleanupManager } from '..'

const compareTargets = (
  target1: DocumentReference | Query | undefined,
  target2: DocumentReference | Query | undefined
) => JSON.stringify(target1) === JSON.stringify(target2)

export class Syncable<T extends DocumentReference | Query> {
  private resetListeners: Array<() => void> = []

  /** Gerencia o cleanup dos snapshot listeners */
  private cleanup: CleanupManager = new CleanupManager()

  /** O que esta sendo syncado */
  private _target: T | undefined

  /** Se um sync esta ativo ou se ja foi descartado */
  private state: 'ready-to-sync' | 'synced' | 'disposed' = 'ready-to-sync'

  /** Callback para executar sempre que houver um novo snapshot para este sync */
  private onNext: (
    snapshot: T extends Query ? QuerySnapshot : DocumentSnapshot
  ) => void

  public get syncState() {
    // Para o publico, utilizamos o estado empty para indicar que nao ha target
    if (!this.target) return 'empty'

    return this.state
  }

  public get target() {
    return this._target
  }

  public dispose = () => this.cleanup.dispose()

  constructor(
    target: T | undefined,
    onNext: (
      snapshot: T extends Query ? QuerySnapshot : DocumentSnapshot
    ) => void
  ) {
    this._target = target
    this.onNext = onNext

    this.cleanup.onDispose(() => (this.state = 'disposed'))
  }

  /** Inicia o sync */
  triggerSync() {
    if (this.state === 'synced' || this.target == undefined) return

    this.state = 'synced'

    const cleanupListener = onSnapshot(this.target as any, this.onNext as any)

    this.cleanup.add(cleanupListener)
  }

  /** Atualiza o alvo de sync, e mantem o estado de sync */
  updateTarget(newTarget: T) {
    if (compareTargets(this.target, newTarget)) return

    // Vai manter este estado
    const previousState = this.state

    // Descarta alvo atual
    this.dispose()

    if (previousState === 'ready-to-sync') {
      this.state = 'ready-to-sync'
      return
    } else if (previousState === 'synced') {
      this.triggerSync()
      return
    }
  }

  /** Reinicia o ref, resetando o alvo para undefined e o estado para 'empty' */
  reset() {
    this.dispose()

    this._target = undefined

    this.state = 'ready-to-sync'

    for (const listener of this.resetListeners) listener()
  }

  onReset(callback: () => void) {
    this.resetListeners.push(callback)
  }
}