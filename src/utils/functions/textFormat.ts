// Splits camelCase text
export const splitCamelCase = (text: string) =>
  text.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
