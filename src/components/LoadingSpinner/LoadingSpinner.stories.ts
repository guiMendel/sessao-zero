import { Meta, StoryObj } from '@storybook/vue3'
import { LoadingSpinner } from '.'

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
} satisfies Meta<typeof LoadingSpinner>

export default meta

export const Default: StoryObj<typeof meta> = {}
