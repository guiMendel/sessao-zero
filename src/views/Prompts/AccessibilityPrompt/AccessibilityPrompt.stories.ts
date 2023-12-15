import { Meta, StoryFn } from '@storybook/vue3'
import { AccessibilityPrompt } from '.'

const meta = {
  title: 'Views/AccessibilityPrompt',
  component: AccessibilityPrompt,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AccessibilityPrompt>

export default meta

const Template: StoryFn<typeof AccessibilityPrompt> = (args) => ({
  setup: () => {
    return { args }
  },
  components: { AccessibilityPrompt },
  template: `<AccessibilityPrompt v-bind="args" />`,
})

export const Default = Template.bind({})
