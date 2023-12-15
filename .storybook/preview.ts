import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { createPinia } from 'pinia'
import '../src/styles/index.scss'
import { initFontAwesome } from '../src/utils/functions/initFontAwesome'
import { authDecorator } from './__mocks__/firebase/auth'

const pinia = createPinia()

// Inclui o font awesome e o pinia no storybook
setup((app) => app.component(...initFontAwesome()).use(pinia))

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
    authDecorator,
  ],
}

export default preview
