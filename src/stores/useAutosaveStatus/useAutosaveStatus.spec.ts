import { fieldRef, sleep } from '@/utils'
import { createPinia, setActivePinia } from 'pinia'
import { AutosaveStatus, useAutosaveStatus } from '.'

describe('useAutosaveStatus', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should return getId that returns a new id on each call', () => {
    const { getId } = useAutosaveStatus()

    let lastCall = getId()
    let newCall = getId()

    expect(newCall).not.toBe(lastCall)

    for (let i = 0; i < 10; i++) {
      lastCall = newCall
      newCall = getId()

      expect(newCall).not.toBe(lastCall)
    }
  })

  describe('should set status accordingly', () => {
    it('idle', () => {
      const store = useAutosaveStatus()

      expect(store.status).toBe(AutosaveStatus.Idle)
    })

    it('persisting', async () => {
      const store = useAutosaveStatus()

      store.trackPromise(new Promise(vi.fn()), 'scooby')

      expect(store.status).toBe(AutosaveStatus.Persisting)
    })

    it('retrying', async () => {
      const store = useAutosaveStatus()

      store.trackPromise(vi.fn().mockRejectedValue(undefined)(), 'scooby')

      await sleep(20)

      expect(store.status).toBe(AutosaveStatus.Retrying)
    })

    it('success', async () => {
      const store = useAutosaveStatus()

      store.successStatusDuration = 50

      store.trackPromise(vi.fn().mockResolvedValue(undefined)(), 'scooby')

      await sleep(20)

      expect(store.status).toBe(AutosaveStatus.Success)

      await sleep(store.successStatusDuration)

      expect(store.status).toBe(AutosaveStatus.Idle)
    })
  })
})
