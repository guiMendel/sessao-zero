import { collection, doc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCurrentUser, useDocument, useFirestore } from 'vuefire'

export const useCurrentPlayer = defineStore('current-player', () => {
  // Pega o firebase user
  const user = useCurrentUser()

  // Pega a db
  const db = useFirestore()

  // Pega o jogador associado a esse user
  const player = useDocument(
    computed(() =>
      user.value ? doc(collection(db, 'players'), user.value?.uid) : undefined
    )
  )

  return { player }
})
