export interface Alert {
  message: string
  type: 'error' | 'success'
  timestamp: Date
  id: number
}
