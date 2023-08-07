import { mountOptions } from '@/tests'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Logo } from '.'

describe('Logo', () => {
  it('should render properly', () => {
    const wrapper = mount(Logo, mountOptions)

    expect(wrapper.html()).toMatchSnapshot()
  })
})
