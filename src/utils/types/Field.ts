export interface Field {
  name: string
  value: string
  valid: boolean
  validate?: (value: string) => true | string
}
