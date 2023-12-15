import { mockPlayer } from '@/tests'
import { Meta, StoryFn } from '@storybook/vue3'
import { JoinGuildPrompt } from '.'
import { mockGuild } from '../../../../tests/helpers/guilds'

const meta = {
  title: 'views/Guilds/JoinGuildPrompt',
  component: JoinGuildPrompt,
  parameters: {
    mockCurrentPlayer: mockPlayer(),
  },
} satisfies Meta

export default meta

const defaultSettings = {
  components: { JoinGuildPrompt },
  setup: () => ({ guild: mockGuild() }),
  template: `<JoinGuildPrompt :guild="guild" />`,
}

export const Default: StoryFn = () => defaultSettings
