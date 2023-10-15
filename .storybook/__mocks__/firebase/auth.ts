import { makeMockUser } from '../utils'

export const getAuth = () => ({})

export const createUserWithEmailAndPassword = () => ({ user: makeMockUser() })

export const signInWithEmailAndPassword = () => ({ user: makeMockUser() })

export const signOut = () => Promise.resolve()

export const updateEmail = () => Promise.resolve()

export const updatePassword = () => Promise.resolve()

export const updateProfile = () => Promise.resolve()
