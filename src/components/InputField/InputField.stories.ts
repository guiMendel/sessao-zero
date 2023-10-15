import { fieldRef } from '@/utils'
import { Meta, StoryFn } from '@storybook/vue3'
import { InputField } from '.'
import { watch } from 'vue'

const meta = {
  title: 'Components/InputField',
  component: InputField,
} satisfies Meta<typeof InputField>

export default meta

// @ts-ignore
const Template: StoryFn<typeof InputField> = (args) => ({
  setup: () => {
    const fields = {
      testEmail: fieldRef('email', (newValue) => {
        if (newValue.length < 3) return 'Mínimo de 3 caracteres'
        return true
      }),

      testPassword: fieldRef('password'),
    }

    return { args, fields }
  },
  components: { InputField },
  template: `
    <div :style="{
      flexDirection: 'column', gap: '1rem', backgroundColor: args.bg, padding: '1rem', borderRadius: '20px'
    }">
      <InputField v-bind="args" :field="fields.testEmail" />
      <InputField v-bind="args" :field="fields.testPassword" />
    </div>
  `,
})

export const Default = Template.bind({})

export const Dark = Template.bind({})
Dark.args = { variant: 'dark', bg: 'var(--bg-main)' } as any
