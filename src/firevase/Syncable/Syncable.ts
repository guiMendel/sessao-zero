import {
  DocumentReference,
  DocumentSnapshot,
  Query,
  QuerySnapshot,
  onSnapshot,
} from 'firebase/firestore'
import { CleanupManager } from '../CleanupManager'

const compareTargets = (
  target1: DocumentReference | Query | undefined,
  target2: DocumentReference | Query | undefined
) =>
  typeof target1 === typeof target2 &&
  JSON.stringify(target1) === JSON.stringify(target2)

type OnNextCallback<T extends DocumentReference | Query> = (
  snapshot: T extends Query ? QuerySnapshot : DocumentSnapshot,
  cleanupManager: CleanupManager
) => void

export class Syncable<T extends DocumentReference | Query> {
  private disposeListeners: Array<() => void> = []
  private resetListeners: Array<() => void> = []
  private beforeSyncListeners: Array<() => void> = []
  private updateTargetListeners: Array<(target: T | undefined) => void> = []

  /** Gerencia o cleanup dos snapshot listeners */
  private cleanup: CleanupManager = new CleanupManager()

  /** O que esta sendo syncado */
  private _target: T | undefined

  /** Se um sync esta ativo ou se ja foi descartado */
  private state: 'ready-to-sync' | 'synced' | 'disposed' = 'ready-to-sync'

  /** Callback para executar sempre que houver um novo snapshot para este sync */
  private onNext: OnNextCallback<T>

  public get syncState() {
    // Para o publico, utilizamos o estado empty para indicar que nao ha target
    if (!this._target) return 'empty'

    return this.state
  }

  public getTarget = () => {
    return this._target
  }

  public getCleanupManager = () => {
    return this.cleanup
  }

  public dispose = () => {
    this.cleanup.dispose()

    for (const listener of this.disposeListeners) listener()
  }

  constructor(target: T | undefined, onNext: OnNextCallback<T>) {
    this._target = target
    this.onNext = onNext

    this.cleanup.onDispose(() => (this.state = 'disposed'))
  }

  /** Inicia o sync */
  triggerSync = () => {
    for (const listener of this.beforeSyncListeners) listener()

    if (this.state === 'synced') return

    // Even when empty, we should set to synced
    // This way, when we do get a target later on, we will know to trigger the sync
    this.state = 'synced'

    if (this._target == undefined) return

    const cleanupListener = onSnapshot(
      this._target as any,
      (snapshot: QuerySnapshot | DocumentSnapshot) =>
        this.onNext(
          snapshot as T extends Query ? QuerySnapshot : DocumentSnapshot,
          this.cleanup
        )
    )

    this.cleanup.add(cleanupListener)
  }

  /** Atualiza o alvo de sync, e mantem o estado de sync */
  updateTarget = (newTarget?: T) => {
    if (compareTargets(this._target, newTarget)) return

    this._target = newTarget

    // Vai manter este estado
    const previousState = this.state

    // Descarta somente o cleanup manager interno
    this.cleanup.dispose()

    if (previousState === 'ready-to-sync') this.state = 'ready-to-sync'
    else if (previousState === 'synced' && newTarget != undefined)
      this.triggerSync()

    for (const listener of this.updateTargetListeners) listener(newTarget)
  }

  /** Reinicia o ref, resetando o alvo para undefined e o estado para 'empty' */
  reset = () => {
    this.dispose()

    this.updateTarget(undefined)

    this.state = 'ready-to-sync'

    for (const listener of this.resetListeners) listener()
  }

  onDispose = (callback: () => void) => {
    this.disposeListeners.push(callback)
  }

  onReset = (callback: () => void) => {
    this.resetListeners.push(callback)
  }

  onUpdateTarget = (callback: (target: T | undefined) => void) => {
    this.updateTargetListeners.push(callback)
  }

  onBeforeSyncTrigger = (callback: () => void) => {
    this.beforeSyncListeners.push(callback)
  }
}
