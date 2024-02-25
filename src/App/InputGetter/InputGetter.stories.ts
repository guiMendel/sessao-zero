import { useInput } from '@/stores'
import { Meta, StoryFn } from '@storybook/vue3'
import { ref } from 'vue'
import { InputGetter } from '.'

export default {
  title: 'App/InputGetter',
  component: InputGetter,
  argTypes: {
    cancellable: { control: 'boolean', defaultValue: true },
    // cancellable: { options: ['yes', 'no'], control: { type: 'radio' } },
  },
} satisfies Meta<{ cancellable: boolean }>

type Story = StoryFn<{ cancellable: boolean }>

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

export const Default: Story = () => ({
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
        cancelValue: false,
        messageHtml: 'Sim ou não?',
      })
        .then((value) => (result.value = value))
        .catch(() => {})

    const getString = () =>
      getStringInput({
        cancelValue: '',
        messageHtml: 'Deixa um cometario',
      })
        .then((value) => (result.value = value))
        .catch(() => {})

    return { result, getBoolean, getString }
  },
})

export const String: Story = () => ({
  ...defaultSettings,
  setup: () => {
    const { getStringInput } = useInput()

    const initialize = () => {
      getStringInput({
        cancelValue: '',
        messageHtml: 'Escreva algo aqui',
      })
        .then(initialize)
        .catch(initialize)
    }

    initialize()
  },
})

export const Boolean: Story = () => ({
  ...defaultSettings,
  setup: () => {
    const { getBooleanInput } = useInput()

    const initialize = () => {
      getBooleanInput({
        cancelValue: false,
        messageHtml: 'Vai dizer?',
      })
        .then(initialize)
        .catch(initialize)
    }

    initialize()
  },
})
