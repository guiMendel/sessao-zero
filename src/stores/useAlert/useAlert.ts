import { ref } from 'vue'
import { defineStore } from '../defineStore'
import { Alert } from './types'

export const useAlert = defineStore('alerts', () => {
  // ===================
  // === NOTIFICATIONS
  // ===================

  // Id generator
  const idGenerator = ref(0)

  // Alert array
  const alerts = ref<{ [key: number]: Alert }>({})

  // Create new alert
  const alert = (type: Alert['type'], message: Alert['message']) => {
    const id = idGenerator.value++

    const alert = {
      type,
      message,
      timestamp: new Date(),
      id,
    }

    alerts.value = {
      ...alerts.value,
      [id]: alert,
    }

    // Erase after timeout
    setTimeout(() => erase(id), timeout.value)

    return alert
  }

  // Erase a alert
  const erase = (id: Alert['id']) => delete alerts.value[id]

  // ===================
  // === TIME OUT
  // ===================

  // How long a alert stays alive for
  const timeout = ref(5000)

  const alterTimeout = (newTimeout: number) => (timeout.value = newTimeout)

  return { alerts, alert, erase, timeout, alterTimeout }
})
