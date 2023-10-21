import { fieldRef } from '@/utils'
import { Meta, StoryFn } from '@storybook/vue3'
import { ToggleField } from '.'
import { ref } from 'vue'

const meta = {
  title: 'Components/ToggleField',
  component: ToggleField,
} satisfies Meta<typeof ToggleField>

export default meta

// @ts-ignore
const Template: StoryFn<typeof ToggleField> = (args) => ({
  setup: () => {
    const value = ref(false)

    return { args, value }
  },
  components: { ToggleField },
  template: `
    <div :style="{
      flexDirection: 'column', gap: '1rem', padding: '1rem', borderRadius: '20px'
    }">
      <ToggleField v-bind="args" v-model="value" label="nacionalidade">sou brasileiro</ToggleField>
    </div>
  `,
})

export const Default = Template.bind({})
