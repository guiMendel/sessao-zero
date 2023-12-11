import { Meta, StoryFn } from '@storybook/vue3'
import { InputGetter } from '.'
import { useInput } from '@/stores'
import { ref } from 'vue'

export default {
  title: 'App/InputGetter',
  component: InputGetter,
  argTypes: {
    cancellable: { control: 'boolean', defaultValue: true },
    // cancellable: { options: ['yes', 'no'], control: { type: 'radio' } },
  },
} satisfies Meta<{ cancellable: boolean }>

type Story = StoryFn<typeof InputGetter>

const defaultSettings = {
  components: { InputGetter },
  template: `
    <div :style="{
      flexDirection: 'column', gap: '1rem', height: '100vh', justifyContent: 'center'
    }">
      <InputGetter />
    </div>
  `,
}

export const Default: Story = (args) => ({
  ...defaultSettings,
  template: `
  <div :style="{
    flexDirection: 'column', gap: '1rem', height: '100vh', justifyContent: 'center'
  }">
    <button @click="getString">String</button>

    <button @click="getBoolean">Boolean</button>

    <p>Result: {{ result }}</p>
  
    <InputGetter />
  </div>
`,

  setup: () => {
    const { getBooleanInput, getStringInput } = useInput()

    const result = ref<string | boolean>('')

    const getBoolean = () =>
      getBooleanInput({
        cancellable: args.cancellable,
        messageHtml: 'Sim ou não?',
      })
        .then((value) => (result.value = value))
        .catch(() => {})

    const getString = () =>
      getStringInput({
        cancellable: args.cancellable,
        messageHtml: 'Deixa um cometario',
      })
        .then((value) => (result.value = value))
        .catch(() => {})

    return { result, getBoolean, getString }
  },
})

export const String: Story = (args) => ({
  ...defaultSettings,
  setup: () => {
    const { getStringInput } = useInput()

    const initialize = () =>
      getStringInput({
        cancellable: args.cancellable,
        messageHtml: 'Escreva algo aqui',
      })
        .then(initialize)
        .catch(initialize)

    initialize()
  },
})

export const Boolean: Story = (args) => ({
  ...defaultSettings,
  setup: () => {
    const { getBooleanInput } = useInput()

    const initialize = () =>
      getBooleanInput({
        cancellable: args.cancellable,
        messageHtml: 'Vai dizer?',
      })
        .then(initialize)
        .catch(initialize)

    initialize()
  },
})