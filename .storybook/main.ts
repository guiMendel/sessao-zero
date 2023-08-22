import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-styling',
    },
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },

  viteFinal: async (config) => {
    if (config.resolve == undefined) config.resolve = { alias: {} }
    if (config.resolve.alias == undefined) config.resolve.alias = {}

    config.resolve.alias['vue-router'] = require.resolve(
      './__mocks__/vue-router.ts'
    )
    config.resolve.alias['firebase/firestore'] = require.resolve(
      './__mocks__/firebase/firestore.ts'
    )
    config.resolve.alias['firebase/auth'] = require.resolve(
      './__mocks__/firebase/auth.ts'
    )

    return config
  },
}
export default config
