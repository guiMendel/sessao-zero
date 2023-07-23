import { Meta, StoryObj } from '@storybook/vue3'
import { Logo } from '.'

const meta = {
  title: 'Components/Logo',
  component: Logo,
  tags: ['autodocs'],
} satisfies Meta<typeof Logo>

export default meta

export const Default: StoryObj<typeof meta> = {}
