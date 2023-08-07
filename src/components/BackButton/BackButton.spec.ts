import { mountOptions } from '@/tests'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { BackButton } from '.'

describe('BackButton', () => {
  it('should render properly', () => {
    const wrapper = mount(BackButton, mountOptions)

    expect(wrapper.html()).toMatchSnapshot()
  })
})
