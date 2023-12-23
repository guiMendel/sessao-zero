import { mockPlayer } from '@/tests'
import { Meta, StoryFn } from '@storybook/vue3'
import { JoinGuildPrompt } from '.'
import { mockGuild } from '../../../../tests/mock/vase/guilds'
import { InputGetter } from '../../../../App/InputGetter'

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
