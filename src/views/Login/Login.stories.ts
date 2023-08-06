import { Meta, StoryFn } from '@storybook/vue3'
import { Login } from '.'

const meta = {
  title: 'Views/Login',
  component: Login,
} satisfies Meta<typeof Login>

export default meta

const Template: StoryFn<typeof Login> = (args) => ({
  setup: () => {
    return { args }
  },
  components: { Login },
  template: `<Login />`,
})

export const Default = Template.bind({})
