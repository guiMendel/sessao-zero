import { Meta, StoryObj } from '@storybook/vue3'
import { BackButton } from '.'

const meta = {
  title: 'Components/BackButton',
  component: BackButton,
  tags: ['autodocs'],
} satisfies Meta<typeof BackButton>

export default meta

export const Default: StoryObj<typeof meta> = {}
