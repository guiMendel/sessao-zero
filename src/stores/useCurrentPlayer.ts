import { auth, usePlayerAPI } from '@/api'
import { PartialUploadable, Player, Uploadable } from '@/types/'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCurrentPlayer = defineStore('current-player', () => {
  /** Acessa a API do firestore do player */
  const { syncPlayer, desyncPlayer, getPlayerDocRef } = usePlayerAPI()

  // A instancia de player atual
  const player = ref<Player | null>(null)

  // Sync do player logado
  auth.onAuthStateChanged(async (newUser) => {
    // Reset user
    if (newUser == null) {
      desyncPlayer()
      player.value = null
    }

    // Sync to new user
    else syncPlayer(newUser.uid, player)
  })

  /** Realiza login do jogador */
  const login = async (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

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
    createUserWithEmailAndPassword(auth, email, password).then(
      async ({ user }) => {
        // Set its name
        await updateProfile(user, { displayName: nickname })

        const date = new Date().toJSON()

        const newPlayer: Uploadable<Player> = {
          name,
          email,
          nickname,
          createdAt: date,
          modifiedAt: date,
        }

        // Set its database entry
        await setDoc(getPlayerDocRef(user.uid), newPlayer)

        return user
      }
    )

  /** Atualiza os dados do jogador logado */
  const update = async (newData: Partial<Player>) => {
    if (auth.currentUser == null) return

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
    const databaseData: Omit<PartialUploadable<Player>, 'createdAt'> = {
      modifiedAt: new Date().toJSON(),
    }

    if (newData.name != undefined) databaseData.name = newData.name
    if (newData.about != undefined) databaseData.about = newData.about
    if (newData.admin != undefined) databaseData.admin = newData.admin
    if (newData.email != undefined) databaseData.email = newData.email
    if (newData.nickname != undefined) databaseData.nickname = newData.nickname

    return updateDoc(getPlayerDocRef(auth.currentUser.uid), databaseData)
  }

  /** Deleta o jogador logado */
  const deleteForever = async () => {
    if (auth.currentUser == null) return

    // Delete database entry
    await deleteDoc(getPlayerDocRef(auth.currentUser.uid))

    return auth.currentUser.delete()
  }

  /** Realiza logout do jogador */
  const logout = async () => signOut(auth)

  return { player, login, logout, create, update, deleteForever }
})
