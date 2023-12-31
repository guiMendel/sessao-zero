import { DocumentReference, onSnapshot } from 'firebase/firestore'
import { Syncable } from '.'
import { Mock } from 'vitest'

vi.mock('firebase/firestore', async () => ({
  ...(await vi.importActual<{}>('firebase/firestore')),
  onSnapshot: vi.fn(),
}))

const mockOnSnapshot = onSnapshot as Mock

const docTarget = 'target' as unknown as DocumentReference

describe('Syncable', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    mockOnSnapshot.mockReturnValue(vi.fn())
  })

  describe('disposal', () => {
    it('should dispose its cleanup manager', () => {
      const disposeCallback = vi.fn()

      const syncable = new Syncable(docTarget, vi.fn())

      syncable.getCleanupManager().add(disposeCallback)

      syncable.dispose()

      expect(disposeCallback).toHaveBeenCalledOnce()
    })

    it('should update state to disposed after calling dispose', () => {
      const syncable = new Syncable(docTarget, vi.fn())

      expect(syncable.syncState).toBe('ready-to-sync')

      syncable.dispose()

      expect(syncable.syncState).toBe('disposed')
    })

    it('should trigger listeners', () => {
      const disposeCallback = vi.fn()

      const syncable = new Syncable(docTarget, vi.fn())

      syncable.onDispose(disposeCallback)

      syncable.dispose()

      expect(disposeCallback).toHaveBeenCalledOnce()
    })
  })

  describe('updating target', () => {
    it('updates the target successfully', () => {
      const syncable = new Syncable(docTarget, vi.fn())

      expect(syncable.getTarget()).toBe(docTarget)

      const newTarget = 'new-target' as unknown as DocumentReference

      syncable.updateTarget(newTarget)

      expect(syncable.getTarget()).toBe(newTarget)
    })

    it('disposes previous sync', () => {
      const disposeCallback = vi.fn()

      const syncable = new Syncable(docTarget, vi.fn())

      syncable.getCleanupManager().add(disposeCallback)

      syncable.updateTarget('new-target' as unknown as DocumentReference)

      expect(disposeCallback).toHaveBeenCalledOnce()
    })

    it.each(['ready-to-sync', 'synced', 'disposed'] as const)(
      'preserves %s state',
      (state) => {
        const syncable = new Syncable(docTarget, vi.fn())

        if (state === 'synced') syncable.triggerSync()
        else if (state === 'disposed') syncable.dispose()

        expect(syncable.syncState).toBe(state)

        syncable.updateTarget('new-target' as unknown as DocumentReference)

        expect(syncable.syncState).toBe(state)
      }
    )

    it('triggers update listeners', () => {
      const syncable = new Syncable(docTarget, vi.fn())

      const updateCallback = vi.fn()

      syncable.onUpdateTarget(updateCallback)

      expect(updateCallback).not.toHaveBeenCalled()

      syncable.updateTarget(undefined)

      expect(updateCallback).toHaveBeenCalledOnce()

      syncable.updateTarget(undefined)

      expect(updateCallback).toHaveBeenCalledTimes(2)
    })
  })

  describe('syncing', () => {
    it('gives empty state when there is no target', () => {
      const syncable = new Syncable(undefined, () => {})

      expect(syncable.syncState).toBe('empty')
    })

    it('ignores triggerSync when there is no target', () => {
      const syncable = new Syncable(undefined, () => {})

      syncable.triggerSync()

      expect(mockOnSnapshot).not.toHaveBeenCalled()
    })

    it('starts a snapshot listener for the given target', () => {
      const listenerArgument = 'snapshot'

      const mockOnNext = vi.fn()

      mockOnSnapshot.mockImplementation((_, listener) => {
        listener(listenerArgument)
        return vi.fn()
      })

      const syncable = new Syncable(docTarget, mockOnNext)

      syncable.triggerSync()

      expect(mockOnSnapshot).toHaveBeenCalledWith(docTarget, expect.anything())
      expect(mockOnNext).toHaveBeenCalledWith(
        listenerArgument,
        syncable.getCleanupManager()
      )
    })

    it('updates state to synced', () => {
      const syncable = new Syncable(docTarget, vi.fn())

      syncable.triggerSync()

      expect(syncable.syncState).toBe('synced')
    })

    it('ignores triggerSync when already synced', () => {
      const syncable = new Syncable(docTarget, vi.fn())

      syncable.triggerSync()

      expect(mockOnSnapshot).toHaveBeenCalledOnce()

      syncable.triggerSync()

      expect(mockOnSnapshot).toHaveBeenCalledOnce()
    })

    it('stores the snapshot listener cleanup', () => {
      const mockCleanup = vi.fn()

      mockOnSnapshot.mockReturnValue(mockCleanup)

      const syncable = new Syncable(docTarget, vi.fn())

      syncable.triggerSync()

      expect(mockCleanup).not.toHaveBeenCalled()

      syncable.dispose()

      expect(mockCleanup).toHaveBeenCalledOnce()
    })

    it('triggers listeners', () => {
      const listener = vi.fn()

      const syncable = new Syncable(docTarget, vi.fn())

      syncable.onBeforeSyncTrigger(listener)

      expect(listener).not.toHaveBeenCalled()

      syncable.triggerSync()

      expect(listener).toHaveBeenCalledOnce()
    })
  })

  describe('resetting', () => {
    it('disposes the sync', () => {
      const disposeCallback = vi.fn()

      const syncable = new Syncable(docTarget, vi.fn())

      syncable.getCleanupManager().add(disposeCallback)

      syncable.reset()

      expect(disposeCallback).toHaveBeenCalledOnce()
    })

    it('discards the target', () => {
      const syncable = new Syncable(docTarget, vi.fn())

      expect(syncable.getTarget()).toBe(docTarget)

      syncable.reset()

      expect(syncable.getTarget()).toBeUndefined()
    })

    it('triggers reset listeners', () => {
      const syncable = new Syncable(docTarget, vi.fn())

      const resetCallback = vi.fn()

      syncable.onReset(resetCallback)

      syncable.reset()

      expect(resetCallback).toHaveBeenCalledOnce()

      syncable.reset()

      expect(resetCallback).toHaveBeenCalledTimes(2)
    })
  })
})
