import { Meta, StoryFn } from '@storybook/vue3'
import { DropdownIcon } from '.'
import { ref, watchEffect } from 'vue'

export default {
  title: 'Components/DropdownIcon',
  component: DropdownIcon,
} satisfies Meta<{ cancellable: boolean }>

type Story = StoryFn<{ cancellable: boolean }>

export const Default: Story = () => ({
  components: { DropdownIcon },

  setup: () => {
    const container = ref(null)

    return { container }
  },

  template: `
  <div
    :style="{
      flexDirection: 'column',
      gap: '1rem',
      height: '90vh',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      boxSizing: 'border-box',
      border: '2px solid gray'
    }"
    ref="container"
  >
    <DropdownIcon :bounding-container="container">
      <div :style="{ display: 'flex', flexDirection: 'column', gap: '1rem' }">
        <p>Option 1</p>
        <p>Option 2</p>
        <p>Option 3</p>
        <p>Option 4</p>
        <p>Option 5</p>
        <p>Option 6</p>
      </div>
    </DropdownIcon>

    <div :style="{ position: 'absolute', top: '0.2rem' }">
      <DropdownIcon :bounding-container="container"
        
        align="right"
        >
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '1rem' }">
          <p>Option 1</p>
          <p>Option 2</p>
          <p>Option 3</p>
          <p>Option 4</p>
          <p>Option 5</p>
          <p>Option 6</p>
        </div>
      </DropdownIcon>
    </div>

    <div :style="{ position: 'absolute', left: '0.2rem' }">
      <DropdownIcon :bounding-container="container"
        
        align="right"
        >
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '1rem' }">
          <p>Option 1</p>
          <p>Option 2</p>
          <p>Option 3</p>
          <p>Option 4</p>
          <p>Option 5</p>
          <p>Option 6</p>
        </div>
      </DropdownIcon>
    </div>

    <div :style="{ position: 'absolute', right: '0.2rem' }">
      <DropdownIcon :bounding-container="container"
        
        align="left"
        >
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '1rem' }">
          <p>Option 1</p>
          <p>Option 2</p>
          <p>Option 3</p>
          <p>Option 4</p>
          <p>Option 5</p>
          <p>Option 6</p>
        </div>
      </DropdownIcon>
    </div>

    <div :style="{ position: 'absolute', bottom: '0.2rem' }">
      <DropdownIcon :bounding-container="container" >
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '1rem' }">
          <p>Option 1</p>
          <p>Option 2</p>
          <p>Option 3</p>
          <p>Option 4</p>
          <p>Option 5</p>
          <p>Option 6</p>
        </div>
      </DropdownIcon>
    </div>
  </div>
`,
})
