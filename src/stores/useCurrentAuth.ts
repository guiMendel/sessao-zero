import { auth } from '@/api'
import { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { Ref, onBeforeUnmount, ref } from 'vue'

/** Permite acesso a uma promessa que indica o atual estado do firebase auth User */
export const useCurrentAuth = defineStore('current-auth', () => {
  /** Listeners de auth change */
  const authChangeListeners: Array<(newUser: User | null) => void> = []

  const listenToAuthChange = (callback: (newUser: User | null) => void) => {
    authChangeListeners.push(callback)

    // Inicializa
    callback(user.value)
  }

  /** O atual user */
  const user = ref<User | null>(null)
  let setUser = (_: User | null) => {}

  /** Resolvera para o user */
  const userPromise = new Promise<Ref<User | null>>(
    (resolve) =>
      (setUser = (newValue) => {
        // Atualiza o ref
        user.value = newValue

        // Garante que a promessa resolve, se ainda nao estiver
        resolve(user)
      })
  )

  const cleanup = auth.onAuthStateChanged((newUser) => {
    setUser(newUser)

    for (const listener of authChangeListeners) listener(newUser)
  })

  onBeforeUnmount(cleanup)

  return { user: userPromise, listenToAuthChange }
})
