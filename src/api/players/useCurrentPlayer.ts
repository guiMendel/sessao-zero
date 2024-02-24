import { auth } from '@/api/firebase'
import { CleanupManager } from '@/firevase/classes/CleanupManager'
import { syncableRef } from '@/firevase/classes/Syncable'
import { Uploadable, useResource } from '@/firevase/resources'
import { defineStore } from '@/stores/defineStore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import { DocumentReference } from 'firebase/firestore'
import { onBeforeUnmount, ref } from 'vue'
import { Player, usePlayerFields } from '.'
import { Vase, vase } from '..'
import { useCurrentAuth, useInput } from '../../stores'

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

  const { getFieldsInput } = useInput()

  player.fetcher.onFetch(async (snapshot) => {
    // Se este jogador nao existe
    if (!snapshot.exists()) {
      const date = new Date().toJSON()

      const { fields: allFields } = usePlayerFields({
        initializeWith: authProviderData.value,
      })

      // Se o oauth providencia o email, nao permitimos mudar
      const fields = authProviderData.value?.email
        ? [allFields.name, allFields.nickname]
        : [allFields.name, allFields.nickname, allFields.email]

      type Fields = Pick<Player, 'email' | 'name' | 'nickname'>

      const result = (await getFieldsInput({
        messageHtml:
          'Que bom te ver por aqui! Antes de podermos começar, vamos precisar de algumas informações suas:',
        fields,
        cancelValue: null,
      })) as Fields | undefined

      // Se o usuario desistir, desloga
      if (!result || !auth.currentUser) {
        logout()
        return
      }

      if (!result.email) result.email = authProviderData.value!.email!

      const newPlayer: Uploadable<Vase, 'players'> = {
        ...result,
        createdAt: date,
        modifiedAt: date,
        preferredGuildId: null,
      }

      // Set the auth and firestore data
      await updateProfile(auth.currentUser, { displayName: newPlayer.nickname })

      await updateEmail(auth.currentUser, newPlayer.email)

      create(newPlayer, snapshot.id)

      return
    }

    // If there is new data available from the provider, use it
    const currentPlayer = snapshot.data() as Uploadable<Vase, 'players'>

    if (
      !currentPlayer.oauthProfilePicture &&
      authProviderData.value?.oauthProfilePicture
    ) {
      updatePlayer({
        oauthProfilePicture: authProviderData.value.oauthProfilePicture,
      })
    }
  })

  // Sync do player logado
  listenToAuthChange(async (newUser) => {
    // Reset user
    if (newUser == null) player.fetcher.reset()
    // Atualiza para o novo usuario
    else {
      player.fetcher.updateTarget(docWithId(newUser.uid))
      player.fetcher.trigger()
    }
  })

  // Quando o login eh feito por auth, um player nao eh criado automaticamente.
  // Guardamos os dados recebidos pelo oauth para utilizar caso detectemos que nao existe
  // um jogador para o usuario logado.
  const authProviderData = ref<undefined | Partial<Player>>(undefined)

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
          preferredGuildId: null,
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
    authProviderData,
  }
})
