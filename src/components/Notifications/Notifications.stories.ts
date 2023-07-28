import { Meta, StoryFn } from '@storybook/vue3'
import { Notifications } from '.'
import { Field } from '../../types/Field.interface'
import { ref } from 'vue'
import { useNotification } from '../../stores'

const meta = {
  title: 'Components/Notifications',
  component: Notifications,
  tags: ['autodocs'],
} satisfies Meta<typeof Notifications>

export default meta

const Template: StoryFn<typeof Notifications> = (args) => ({
  setup: () => {
    const { notify } = useNotification()

    const showSuccess = () => notify('success', 'Trago ótimas notícias!')
    const showError = () => notify('error', 'Algo terrível nos sucedeu.')

    return { args, showSuccess, showError }
  },
  components: { Notifications },
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
