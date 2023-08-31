import { mountOptions } from '@/tests'
import { Field } from '@/types/Field.interface'
import { splitCamelCase } from '@/utils'
import { VueWrapper, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { InputField } from '.'

const makeField = (overrides?: Partial<Field>): Field => ({
  name: 'testField',
  valid: true,
  value: 'scooby doo',
  ...overrides,
})

const getLastModelValueUpdate = (wrapper: VueWrapper) =>
  (wrapper.emitted()['update:modelValue'][0] as Field[])[0]

describe.each([{ multiline: true }, { multiline: false }])(
  'InputField with multiline $multiline',
  ({ multiline }) => {
    const inputType = multiline ? 'textarea' : 'input'

    it("should show the field's name", () => {
      const name = 'scoobyDoo'

      const wrapper = mount(InputField, {
        ...mountOptions,
        props: { modelValue: makeField({ name }), multiline },
      })

      expect(wrapper.text()).toContain(splitCamelCase(name))
    })

    it("should sync the field's value with the input's value", async () => {
      let value = 'scooby doo'

      const wrapper = mount(InputField, {
        ...mountOptions,
        props: { modelValue: makeField({ value }), multiline },
      })

      const input = wrapper.get(inputType)

      // Valor inicial
      expect(input.element.value).toBe(value)

      // Mudar valor do field
      value = 'shaggy'
      await wrapper.setProps({ modelValue: makeField({ value }) })
      expect(input.element.value).toBe(value)

      // Mudar valor do input
      value = 'bob'
      await input.setValue(value)

      expect(getLastModelValueUpdate(wrapper)).toHaveProperty('value', value)
    })

    it('should set valid to false and show error when appropriate', async () => {
      const error = 'oops, scooby bad!'

      const wrapper = mount(InputField, {
        ...mountOptions,
        props: { modelValue: makeField({ validate: () => error }), multiline },
      })

      await wrapper.get(inputType).setValue('value')

      expect(getLastModelValueUpdate(wrapper)).toHaveProperty('valid', false)

      expect(wrapper.text()).toContain(error)
    })

    it.each([[true], [false]])(
      'should adequately set focus when autoFocus is %s',
      async (autoFocus) => {
        const wrapper = mount(InputField, {
          ...mountOptions,
          props: { modelValue: makeField(), autoFocus, multiline },
          attachTo: document.body,
        })

        const input = wrapper.get(inputType).element

        await nextTick()

        if (autoFocus) expect(document.activeElement).toBe(input)
        else expect(document.activeElement).not.toBe(input)
      }
    )

    if (multiline == false)
      it.each([
        [['password'], 'password'],
        [['color'], 'color'],
      ])(
        `should assign field names %o to ${inputType} type %s`,
        (names, result) => {
          for (const name of names) {
            const wrapper = mount(InputField, {
              ...mountOptions,
              props: { modelValue: makeField({ name }), multiline },
            })

            const input = wrapper.get(inputType)

            expect(input.element.type).toBe(result)
          }
        }
      )

    if (multiline == false)
      it('should assign type text to password field when toggling show password', async () => {
        const wrapper = mount(InputField, {
          ...mountOptions,
          props: { modelValue: makeField({ name: 'password' }), multiline },
        })

        const input = wrapper.get(inputType)
        const toggle = wrapper.get('.password-reveal')

        expect(input.element.type).toBe('password')

        // Toggle to true
        await toggle.trigger('click')

        expect(input.element.type).toBe('text')

        // Toggle to false again
        await toggle.trigger('click')

        expect(input.element.type).toBe('password')
      })
  }
)
