import { fieldRef, sleep } from '@/utils'
import { useAutosaveForm } from '.'
import { nextTick } from 'vue'
import { useAutosaveStatus } from '@/stores'
import { Mock } from 'vitest'

vi.mock('@/stores', async () => ({
  ...(await vi.importActual<{}>('@/stores')),
  useAutosaveStatus: vi.fn(),
}))

const mockUseAutosaveStatus = useAutosaveStatus as unknown as Mock

const mockGetId = vi.fn()
const mockForgetPromise = vi.fn()
const mockTrackPromise = vi.fn()

describe('useAutosaveForm', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    mockUseAutosaveStatus.mockReturnValue({
      getId: mockGetId.mockReturnValue('test-id'),
      forgetPromise: mockForgetPromise,
      trackPromise: mockTrackPromise,
    })
  })

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


  it('should not call persist if the change is invalid', async () => {
    const persist = vi.fn().mockResolvedValue(undefined)

    const { fields } = useAutosaveForm(
      {
        test: fieldRef('test', {
          persist,
          validator: () => 'nooo',
          initialValue: 'booya',
        }),
      },
      { throttleAmount: 0 }
    )

    const newValue1 = 'bambam'
    fields.test.value = newValue1

    await sleep(20)

    expect(persist).not.toHaveBeenCalled()
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

})
