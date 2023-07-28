import { Meta, StoryObj } from '@storybook/vue3'
import { Logo } from '.'

const meta = {
  title: 'Components/Logo',
  component: Logo,
} satisfies Meta<typeof Logo>

export default meta

export const Default: StoryObj<typeof meta> = {}
