import { Meta, StoryFn } from '@storybook/vue3'
import { GuildConfigurations } from '.'

const meta = {
  title: 'Views/GuildConfigurations',
  component: GuildConfigurations,
} satisfies Meta<typeof GuildConfigurations>

export default meta

const Template: StoryFn<typeof GuildConfigurations> = (args) => ({
  setup: () => {
    return { args }
  },
  components: { GuildConfigurations },
  template: `<GuildConfigurations style="padding: 2rem" class="preset-grid-background" />`,
})

export const Default = Template.bind({})
