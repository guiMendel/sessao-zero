import { makeMockUser } from './utils'

export const useFirestore = () => ({})

export const useCurrentUser = makeMockUser

export const useDocument = () => ({ data: { value: {} } })

export const useFirebaseAuth = () => ({})
