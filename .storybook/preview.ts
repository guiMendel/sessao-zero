import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import '../src/styles/index.scss'
import { initFontAwesome } from '../src/utils/functions/initFontAwesome'

// Inclui o font awesome no storybook
setup((app) => app.component(...initFontAwesome()))

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    () => ({
      template: `<div id="app"><story /></div>`,
    }),
  ],
}

export default preview
