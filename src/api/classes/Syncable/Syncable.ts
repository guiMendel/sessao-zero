import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
  onSnapshot,
} from 'firebase/firestore'
import { CleanupManager } from '..'

const compareTargets = (
  target1: DocumentReference | Query,
  target2: DocumentReference | Query
) => JSON.stringify(target1) === JSON.stringify(target2)

export class Syncable<T extends DocumentReference | Query> {
  /** Gerencia o cleanup dos snapshot listeners */
  private cleanup: CleanupManager = new CleanupManager()

  /** O que esta sendo syncado */
  private _target: T

  /** Se um sync esta ativo ou se ja foi descartado */
  private state: 'ready-to-sync' | 'synced' | 'disposed' = 'ready-to-sync'

  /** Callback para executar sempre que houver um novo snapshot para este sync */
  private onNext: (
    snapshot: T extends Query ? QuerySnapshot : DocumentSnapshot
  ) => void

  public get syncState() {
    return this.state
  }

  public get target() {
    return this._target
  }

  public dispose = () => this.cleanup.dispose()

  constructor(
    target: T,
    onNext: (
      snapshot: T extends Query ? QuerySnapshot : DocumentSnapshot
    ) => void
  ) {
    this._target = target
    this.onNext = onNext

    this.cleanup.onDispose(() => (this.state = 'disposed'))
  }

  triggerSync() {
    if (this.state === 'synced') return

    this.state = 'synced'

    const cleanupListener = onSnapshot(this.target as any, this.onNext as any)

    this.cleanup.add(cleanupListener)
  }

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
}
