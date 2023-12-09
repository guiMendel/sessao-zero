import { Meta, StoryFn } from '@storybook/vue3'
import { AutosaveNotification } from '.'
import { AutosaveStatus, useAutosaveStatus } from '@/stores'
import { sleep } from '@/utils'

const meta = {
  title: 'Components/AutosaveNotification',
  component: AutosaveNotification,
} satisfies Meta<typeof AutosaveNotification>

export default meta

type Story = StoryFn<typeof AutosaveNotification>

const defaultSettings = {
  components: { AutosaveNotification },
  template: `
    <div :style="{
      flexDirection: 'column', gap: '1rem', color: 'white', height: '100vh', justifyContent: 'center'
    }">
      <AutosaveNotification />
    </div>
  `,
}

export const Default: Story = () => ({
  ...defaultSettings,
  template: `
  <div :style="{
    flexDirection: 'column', gap: '1rem', color: 'white', height: '100vh', justifyContent: 'center'
  }">
    <button @click="showSuccess" :style="{ backgroundColor: 'lime' }">Sucesso</button>

    <button @click="showSuccessDelayed" :style="{ backgroundColor: 'lime' }">Sucesso demorado</button>

    <button @click="showError" :style="{ backgroundColor: 'red' }">Erro</button>
  
    <AutosaveNotification />
  </div>
`,

  setup: () => {
    const store = useAutosaveStatus()

    store.successStatusDuration = 2000

    const promisedId = 'scooby'

    const showSuccess = () => {
      store.trackPromise(sleep(100), promisedId)
    }

    const showSuccessDelayed = () => {
      store.trackPromise(sleep(1500), promisedId)
    }

    const showError = () => {
      store.trackPromise(
        new Promise((_, reject) =>
          setTimeout(() => {
            reject()
          }, 1500)
        ),
        promisedId
      )
    }

    return { showError, showSuccessDelayed, showSuccess }
  },
})

export const Persisting: Story = () => ({
  ...defaultSettings,
  setup: () => {
    const { trackPromise } = useAutosaveStatus()

    trackPromise(new Promise(() => {}), 'scooby')
  },
})

export const Retrying: Story = () => ({
  ...defaultSettings,
  setup: () => {
    const { trackPromise } = useAutosaveStatus()

    trackPromise(Promise.reject(undefined), 'scooby')
  },
})

export const Success: Story = () => ({
  ...defaultSettings,
  setup: () => {
    const store = useAutosaveStatus()

    store.successStatusDuration = 9999999

    store.trackPromise(Promise.resolve(undefined), 'scooby')
  },
})
