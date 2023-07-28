import { Meta, StoryObj } from '@storybook/vue3'
import { IconButton } from '.'

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
} satisfies Meta<typeof IconButton>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    icon: 'paper-plane',
  },
}
