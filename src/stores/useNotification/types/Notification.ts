export interface Notification {
  message: string
  type: 'error' | 'success'
  timestamp: Date
  id: number
}
