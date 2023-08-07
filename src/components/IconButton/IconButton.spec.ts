import { mountOptions } from '@/tests'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { IconButton } from '.'

describe('IconButton', () => {
  it('should render properly', () => {
    const wrapper = mount(IconButton, mountOptions)

    expect(wrapper.html()).toMatchSnapshot()
  })
})
