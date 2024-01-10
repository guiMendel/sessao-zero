import { storeToRefs } from 'pinia'
import { Mock } from 'vitest'
import { unwrapStore } from '.'

vi.mock('pinia')

const mockStoreToRefs = storeToRefs as Mock

describe('unrwapStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    mockStoreToRefs.mockImplementation((arg) => ({
      ...arg,
      scooby: 'replaced',
    }))
  })

  it('should return the object itself and the results of storeToRefs', () => {
    const store = { ok: () => 2, scooby: true }

    expect(unwrapStore(store as any)).toStrictEqual({
      ...store,
      scooby: 'replaced',
    })
  })
})
