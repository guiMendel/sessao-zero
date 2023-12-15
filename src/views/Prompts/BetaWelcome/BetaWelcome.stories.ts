import { Meta, StoryFn } from '@storybook/vue3'
import { BetaWelcome } from '.'

const meta = {
  title: 'Views/BetaWelcome',
  component: BetaWelcome,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof BetaWelcome>

export default meta

const Template: StoryFn<typeof BetaWelcome> = (args) => ({
  setup: () => {
    return { args }
  },
  components: { BetaWelcome },
  template: `<BetaWelcome v-bind="args" />`,
})

export const Default = Template.bind({})
