/** Values accepted by the vanilla select element */
export type SelectOptionValueConstraints =
  | string
  | number
  | readonly string[]
  | undefined

/** How each option is interpreted */
export type SelectOption<T extends SelectOptionValueConstraints> =
  | T
  | {
      /** How the option will be displayed */
      label: string
      /** Value this option holds when selected */
      value: T
      /** Whether not to display this option in the dropdown (it's still selectable from code).
       * See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden
       */
      hidden?: boolean
      /** Whether to make this option non-selectable.
       * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#disabled
       */
      disabled?: boolean
    }

export const isSelectOptionDisabled = <T extends SelectOptionValueConstraints>(
  option: SelectOption<T>
): boolean => {
  if (typeof option === 'object' && option && 'disabled' in option)
    return Boolean(option.disabled)

  return false
}

export const isSelectOptionHidden = <T extends SelectOptionValueConstraints>(
  option: SelectOption<T>
): boolean => {
  if (typeof option === 'object' && option && 'hidden' in option)
    return Boolean(option.hidden)

  return false
}

export const getSelectOptionLabel = <T extends SelectOptionValueConstraints>(
  option: SelectOption<T>
): string => {
  if (typeof option === 'string') return option

  if (typeof option === 'object' && option) {
    if ('label' in option) return option.label
    if ('value' in option) return JSON.stringify(option.value)
  }

  return JSON.stringify(option)
}

export const getSelectOptionValue = <T extends SelectOptionValueConstraints>(
  option: SelectOption<T>
): T => {
  if (typeof option === 'object' && option && 'value' in option)
    return option.value

  return option
}
