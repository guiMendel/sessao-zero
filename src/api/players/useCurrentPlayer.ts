import { auth } from '@/api/firebase'
import { CleanupManager } from '@/firevase/CleanupManager'
import { syncableRef } from '@/firevase/Syncable'
import { Uploadable, useResource } from '@/firevase/resources'
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
import { onBeforeUnmount } from 'vue'
import { Player } from '.'
import { Vase, vase } from '..'
import { useCurrentAuth } from '../../stores'

export const useCurrentPlayer = defineStore('current-player', () => {
  const { listenToAuthChange } = useCurrentAuth()

  /** O cleanup manager deste hook */
  const cleanupManager = new CleanupManager()

  /** Acessa a API do firestore do player */
  const { docWithId, create, update, deleteForever } = useResource(
    vase,
    'players'
  )

  /** A instancia de player atual */
  const player = syncableRef<Vase, 'players', DocumentReference>(
    vase,
    'players',
    'empty-document',
    cleanupManager,
    { resourceLayersLimit: 2 }
  )

  // Sync do player logado
  listenToAuthChange(async (newUser) => {
    // Reset user
    if (newUser == null) player.sync.reset()
    // Atualiza para o novo usuario
    else {
      player.sync.updateTarget(docWithId(newUser.uid))
      player.sync.triggerSync()
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

        const newPlayer: Uploadable<Vase, 'players'> = {
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

  onBeforeUnmount(() => cleanupManager.dispose())

  return {
    player,
    login,
    logout,
    create: createPlayer,
    update: updatePlayer,
    deleteForever: deletePlayer,
  }
})
