import { Meta, StoryFn } from '@storybook/vue3'
import { ref } from 'vue'
import { SelectField } from '.'

const options = ['banana', 'laranja', 'abacate'] as const

type Options = (typeof options)[number]

const meta = {
  title: 'Components/SelectField',
  // @ts-ignore
  component: SelectField<Options>,
} satisfies Meta<typeof SelectField>

export default meta

const Template: StoryFn<typeof SelectField> = (args) => ({
  setup: () => {
    const selected = ref<Options>(options[0])

    return { args, selected, options }
  },
  components: { SelectField },
  template: `
    <div :style="{
      flexDirection: 'column', gap: '1rem', padding: '1rem', borderRadius: '20px'
    }">
      <SelectField label="fruta favorita" v-bind="args" v-model="selected" :options="options" />
    </div>
  `,
})

export const Default = Template.bind({})
