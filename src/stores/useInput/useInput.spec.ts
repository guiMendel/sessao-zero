import { createPinia, setActivePinia } from 'pinia'
import { useInput } from '.'

describe('useInput', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should store params in currentInput', async () => {
    const store = useInput()

    expect(store.currentInput).toBeUndefined()

    // STRING
    const stringParams = { scooby: 'snacks' }

    store.getStringInput(stringParams as any)

    expect(store.currentInput).toStrictEqual({
      getter: {
        ...stringParams,
        type: 'string',
      },
      resolve: expect.anything(),
      reject: undefined,
    })

    // BOOLEAN
    const booleanParams = { baba: 'yaga' }

    store.getStringInput(booleanParams as any)

    expect(store.currentInput).toStrictEqual({
      getter: {
        ...booleanParams,
        type: 'string',
      },
      resolve: expect.anything(),
      reject: undefined,
    })
  })

  it('should have methods that resolve with the resolve call, and then set currentInput to undefined', async () => {
    const store = useInput()

    // STRING
    let stringResolved = ''
    const stringResult = 'scooby'

    const stringPromise = store
      .getStringInput({} as any)
      .then((value) => (stringResolved = value))

    store.currentInput.value?.resolve(stringResult)

    await stringPromise

    expect(stringResolved).toBe(stringResult)
    expect(store.currentInput).toBeUndefined()

    // BOOLEAN
    let booleanResolved = false
    const booleanResult = true

    const booleanPromise = store
      .getBooleanInput({} as any)
      .then((value) => (booleanResolved = value))

    store.currentInput.value?.resolve(booleanResult)

    await booleanPromise

    expect(booleanResolved).toBe(booleanResult)
    expect(store.currentInput).toBeUndefined()
  })

  it('should have methods that reject with the reject call if cancellable is true and then set currentInput to undefined', async () => {
    const store = useInput()

    // STRING
    const stringPromise = store.getStringInput({ cancellable: true } as any)

    store.currentInput.value!.resolve!(undefined)

    await stringPromise

    expect(store.currentInput).toBeUndefined()

    // BOOLEAN
    const booleanPromise = store.getBooleanInput({ cancellable: true } as any)

    store.currentInput.value!.resolve!(undefined)

    await booleanPromise

    expect(store.currentInput).toBeUndefined()
  })

  it('should not store reject if cancellable is false', async () => {
    const store = useInput()

    // STRING
    store.getStringInput({ cancellable: false } as any)

    expect(store.currentInput).not.toBeUndefined()

    // BOOLEAN
    store.getBooleanInput({ cancellable: false } as any)

    expect(store.currentInput).not.toBeUndefined()
  })
})
