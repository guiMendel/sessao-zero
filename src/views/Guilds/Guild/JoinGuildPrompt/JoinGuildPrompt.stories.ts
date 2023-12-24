import { mockPlayer } from '@/tests/mock/vase'
import { Meta, StoryFn } from '@storybook/vue3'
import { JoinGuildPrompt } from '.'
import { InputGetter } from '../../../../App/InputGetter'
import { mockGuild } from '../../../../tests/mock/vase/guilds'

const meta = {
  title: 'views/Guilds/JoinGuildPrompt',
  component: JoinGuildPrompt,
  parameters: {
    mockCurrentPlayer: mockPlayer(),
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta

const defaultSettings = {
  components: { JoinGuildPrompt, InputGetter },
  setup: () => ({
    guild: mockGuild(),
  }),
  template: `<div> <InputGetter /> <JoinGuildPrompt :guild="guild" /> </ div>`,
}

export const Default: StoryFn = () => defaultSettings
