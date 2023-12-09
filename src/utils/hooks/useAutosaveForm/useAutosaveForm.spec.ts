import { AutosaveStatus, fieldRef, sleep } from '@/utils'
import { useAutosaveForm } from '.'
import { nextTick } from 'vue'

describe('useAutosaveForm', () => {
  it('should throttle calls to persist when a field changes', async () => {
    const persist = vi.fn().mockResolvedValue(undefined)

    const throttleAmount = 50

    const { fields } = useAutosaveForm(
      {
        test: fieldRef('test', { persist, initialValue: 'booya' }),
      },
      { throttleAmount }
    )

    const newValue1 = 'bambam'
    fields.test.value = newValue1

    await sleep(throttleAmount - 20)

    const newValue2 = 'scooby'
    fields.test.value = newValue2

    await nextTick()

    expect(persist).not.toHaveBeenCalled()

    await sleep(throttleAmount)

    expect(persist).toHaveBeenCalledOnce()
    expect(persist).toHaveBeenCalledWith(newValue2)
  })

  it('should retry if the persist fails', async () => {
    const persist = vi.fn().mockRejectedValue(undefined)

    const retryDelay = 20

    const { fields, cleanup } = useAutosaveForm(
      {
        test: fieldRef('test', { persist, initialValue: 'booya' }),
      },
      { retryDelay, throttleAmount: 0 }
    )

    fields.test.value = 'bambam'

    await nextTick()

    expect(persist).toHaveBeenCalledOnce()

    await nextTick()

    await sleep(retryDelay * 2)

    expect(persist).toHaveBeenCalledTimes(2)

    cleanup()
  })

  describe('should set status accordingly', () => {
    it('idle', () => {
      const { status } = useAutosaveForm({
        test: fieldRef('test', { initialValue: 'booya' }),
      })

      expect(status.value).toBe(AutosaveStatus.Idle)
    })

    it('persisting', async () => {
      const persist = vi.fn().mockImplementation(async () => {
        await sleep(100)
      })

      const { status, fields } = useAutosaveForm(
        {
          test: fieldRef('test', { initialValue: 'booya', persist }),
        },
        { throttleAmount: 0 }
      )

      expect(status.value).toBe(AutosaveStatus.Idle)

      fields.test.value = 'bambam'

      await nextTick()

      expect(status.value).toBe(AutosaveStatus.Persisting)
    })

    it('retrying', async () => {
      const persist = vi.fn().mockRejectedValue(undefined)

      const { status, fields, cleanup } = useAutosaveForm(
        {
          test: fieldRef('test', { initialValue: 'booya', persist }),
        },
        { throttleAmount: 0 }
      )

      expect(status.value).toBe(AutosaveStatus.Idle)

      fields.test.value = 'bambam'

      await sleep(10)

      expect(status.value).toBe(AutosaveStatus.Retrying)

      cleanup()
    })

    it('success', async () => {
      const persist = vi.fn().mockResolvedValue(undefined)

      const successStatusDuration = 20

      const { status, fields } = useAutosaveForm(
        {
          test: fieldRef('test', { initialValue: 'booya', persist }),
        },
        { throttleAmount: 0, successStatusDuration }
      )

      expect(status.value).toBe(AutosaveStatus.Idle)

      fields.test.value = 'bambam'

      await sleep(10)

      expect(status.value).toBe(AutosaveStatus.Success)

      await sleep(2 * successStatusDuration)

      expect(status.value).toBe(AutosaveStatus.Idle)
    })
  })
})
