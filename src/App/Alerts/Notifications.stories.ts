import { useAlert } from '@/stores'
import { Meta, StoryFn } from '@storybook/vue3'
import { Alerts } from '.'

const meta = {
  title: 'App/Notifications',
  component: Alerts,
} satisfies Meta<typeof Alerts>

export default meta

const Template: StoryFn<typeof Alerts> = (args) => ({
  setup: () => {
    const { alert: notify } = useAlert()

    const showSuccess = () => notify('success', 'Trago ótimas notícias!')
    const showError = () => notify('error', 'Algo terrível nos sucedeu.')

    return { args, showSuccess, showError }
  },
  components: { Notifications: Alerts },
  template: `
    <div :style="{
      flexDirection: 'column', gap: '1rem', color: 'white', height: '100vh', justifyContent: 'center'
    }">
      <Notifications v-bind="args" />

      <button @click="showSuccess" :style="{ backgroundColor: 'lime' }">Sucesso</button>

      <button @click="showError" :style="{ backgroundColor: 'red' }">Erro</button>
    </div>
  `,
})

export const Default = Template.bind({})
