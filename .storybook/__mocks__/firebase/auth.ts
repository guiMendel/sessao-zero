import type { Decorator } from '@storybook/vue3'
import { makeMockUser } from '../utils'
import { onSnapshotSendData } from './firestore'

let updatePlayer = (player: any) => {}

export const authDecorator: Decorator = (story, { parameters }) => {
  // Guarda esse player na base para que o onSnapshot envie ele quando receber seu id como target
  if (parameters?.mockCurrentPlayer) {
    parameters.mockCurrentPlayer.uid = parameters.mockCurrentPlayer.id

    onSnapshotSendData[parameters.mockCurrentPlayer.id] =
      parameters.mockCurrentPlayer
  }

  // Gera um auth state changed event do firebase
  updatePlayer(parameters?.mockCurrentPlayer)

  return story()
}

export const getAuth = () => ({
  onAuthStateChanged: (authListener: (player: any) => void) =>
    (updatePlayer = authListener),
})

export const createUserWithEmailAndPassword = () => ({ user: makeMockUser() })

export const signInWithEmailAndPassword = () => ({ user: makeMockUser() })

export const signOut = () => Promise.resolve()

export const updateEmail = () => Promise.resolve()

export const updatePassword = () => Promise.resolve()

export const updateProfile = () => Promise.resolve()
