import { auth, syncableRef, useResourceAPI } from '@/api'
import { Player, Uploadable } from '@/types/'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { DocumentReference } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { useCurrentAuth } from '.'

export const useCurrentPlayer = defineStore('current-player', () => {
  const { listenToAuthChange } = useCurrentAuth()

  /** Acessa a API do firestore do player */
  const { snapshotToResources, getDoc, create, update, deleteForever } =
    useResourceAPI<Player>('players')

  /** A instancia de player atual */
  const player = syncableRef<Player, DocumentReference>(
    undefined,
    snapshotToResources
  )

  // Sync do player logado
  listenToAuthChange(async (newUser) => {
    // Reset user
    if (newUser == null) player.reset()
    // Atualiza para o novo usuario
    else {
      player.updateTarget(getDoc(newUser.uid))
      player.triggerSync()
    }
  })

  /** Realiza login do jogador */
  const login = async (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

  /** Cria um novo jogador */
  const createPlayer = async ({
    email,
    password,
    name,
    nickname,
  }: Player & { password: string }) =>
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
        create(newPlayer, user.uid)

        return user
      }
    )

  /** Atualiza os dados do jogador logado */
  const updatePlayer = async (newData: Partial<Player>) => {
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
    return update(auth.currentUser.uid, newData)
  }

  /** Deleta o jogador logado */
  const deletePlayer = async () => {
    if (auth.currentUser == null) return

    // Delete database entry
    await deleteForever(auth.currentUser.uid)

    return auth.currentUser.delete()
  }

  /** Realiza logout do jogador */
  const logout = async () => signOut(auth)

  return {
    player,
    login,
    logout,
    create: createPlayer,
    update: updatePlayer,
    deleteForever: deletePlayer,
  }
})
