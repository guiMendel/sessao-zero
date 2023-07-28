import { Meta, StoryFn } from '@storybook/vue3'
import { InputField } from '.'
import { Field } from '../../types/Field.interface'
import { ref } from 'vue'

const meta = {
  title: 'Components/InputField',
  component: InputField,
} satisfies Meta<typeof InputField>

export default meta

const Template: StoryFn<typeof InputField> = (args) => ({
  setup: () => {
    const testEmail = ref<Field>({
      name: 'email',
      valid: true,
      value: '',
      validate: (newValue) => {
        if (newValue.length < 3) return 'Mínimo de 3 caracteres'
        return true
      },
    })

    const testPassword = ref<Field>({
      name: 'senha',
      valid: true,
      value: '',
    })

    const updateEmail = ({ value }: { value: string }) =>
      (testEmail.value.value = value)

    const updatePassword = ({ value }: { value: string }) =>
      (testPassword.value.value = value)

    return { args, testEmail, updateEmail, testPassword, updatePassword }
  },
  components: { InputField },
  template: `
    <div :style="{
      flexDirection: 'column', gap: '1rem', backgroundColor: args.bg, padding: '1rem', borderRadius: '20px'
    }">
      <InputField v-bind="args" :model-value="testEmail" @update:model-value="updateEmail" />
      <InputField v-bind="args" :model-value="testPassword" @update:model-value="updatePassword" />
    </div>
  `,
})

export const Default = Template.bind({})

export const Dark = Template.bind({})
Dark.args = { variant: 'dark', bg: 'var(--bg-main)' } as any
