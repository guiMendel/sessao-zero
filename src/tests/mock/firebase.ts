// Import the functions you need from the SDKs you need
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'
import { Mock } from 'vitest'

vi.mock('firebase/app')
vi.mock('firebase/auth')
vi.mock('firebase/firestore')

const firebaseConfig: FirebaseOptions = {
  apiKey: 'apiKey',
  authDomain: 'authDomain',
  projectId: 'projectId',
  storageBucket: 'storageBucket',
  messagingSenderId: 'messagingSenderId',
  appId: 'appId',
}

export const mockFirebaseApp = firebaseConfig as FirebaseApp

export const mockAuth = {} as Auth

export const mockDb = {} as Firestore

/** Sets up firebase functions for returning mocks.
 * User this when your tests rely on auth and db not being undefined.
 */
export const setUpFirebaseMocks = () => {
  ;(initializeApp as Mock).mockReturnValue(mockFirebaseApp)
  ;(getAuth as Mock).mockReturnValue(mockAuth)
  ;(getFirestore as Mock).mockReturnValue(mockDb)
}
