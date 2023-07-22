import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { defineStore } from 'pinia'
import { computed } from 'vue'
import {
  useCurrentUser,
  useDocument,
  useFirebaseAuth,
  useFirestore,
} from 'vuefire'
import { Player, PlayerResource } from '../types/Player.interface'
import { Uploadable } from '../types/Resource.interface'

export const useCurrentPlayer = defineStore('current-player', () => {
  // Pega o firebase user
  const user = useCurrentUser()

  // Pega a db
  const db = useFirestore()

  // Pega o auth
  const auth = useFirebaseAuth()

  // Pega uma referencia a um doc de jogador
  const getPlayerDocRef = (uid: string) => doc(db, 'players', uid)

  /** O jogador atualmente logado */
  const player = useDocument(
    computed(() =>
      user.value ? doc(collection(db, 'players'), user.value?.uid) : undefined
    )
  )

  /** Realiza login do jogador */
  const login = async (email: string, password: string) =>
    auth && signInWithEmailAndPassword(auth, email, password)

  /** Cria um novo jogador */
  const create = async ({
    email,
    password,
    name,
    nickname,
  }: {
    email: string
    password: string
    name: string
    nickname: string
  }) =>
    auth &&
    createUserWithEmailAndPassword(auth, email, password).then(
      async ({ user }) => {
        // Set its name
        await updateProfile(user, { displayName: nickname })

        const date = new Date().toJSON()

        // Set its database entry
        await setDoc(getPlayerDocRef(user.uid), {
          name,
          email,
          nickname,
          createdAt: date,
          modifiedAt: date,
        })

        return user
      }
    )

  /** Atualiza os dados do jogador logado */
  const update = async (newData: Partial<Player>) => {
    if (auth?.currentUser == null) return

    // Handle email change
    if (newData.email != undefined)
      await updateEmail(auth.currentUser, newData.email)

    // Handle password change
    if (newData.password != undefined)
      await updatePassword(auth.currentUser, newData.password)

    // Handle name change
    if (newData.nickname != undefined)
      await updateProfile(auth.currentUser, { displayName: newData.nickname })

    // Set database data
    const databaseData: Uploadable<PlayerResource> = {
      modifiedAt: new Date().toJSON(),
    }

    if (newData.name != undefined) databaseData.name = newData.name
    if (newData.about != undefined) databaseData.about = newData.about
    if (newData.admin != undefined) databaseData.admin = newData.admin
    if (newData.email != undefined) databaseData.email = newData.email
    if (newData.nickname != undefined) databaseData.nickname = newData.nickname

    return updateDoc(getPlayerDocRef(auth.currentUser.uid), databaseData)
  }

  const deleteForever = async () => {
    if (auth?.currentUser == null) return

    // Delete database entry
    await deleteDoc(getPlayerDocRef(auth.currentUser.uid))

    return auth.currentUser.delete()
  }

  return { player, login, create, update, deleteForever }
})