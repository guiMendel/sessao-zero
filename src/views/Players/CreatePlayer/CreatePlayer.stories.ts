import { Meta, StoryFn } from '@storybook/vue3'
import { CreatePlayer } from '.'

const meta = {
  title: 'Views/CreatePlayer',
  component: CreatePlayer,
} satisfies Meta<typeof CreatePlayer>

export default meta

const Template: StoryFn<typeof CreatePlayer> = (args) => ({
  setup: () => {
    return { args }
  },
  components: { CreatePlayer },
  template: `<CreatePlayer />`,
})

export const Default = Template.bind({})
