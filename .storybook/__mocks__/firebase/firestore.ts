import { makeMockSnapshot } from '../utils'

export const getFirestore = () => ({})

export const collection = () => ({})

export const doc = () => ({})

export const query = () => ({})

export const where = () => ({})

export const setDoc = () => Promise.resolve({})

export const updateDoc = () => Promise.resolve({})

export const deleteDoc = () => Promise.resolve()

export const addDoc = () => Promise.resolve({})

export const getDoc = () => Promise.resolve(makeMockSnapshot())

export const getDocs = () => Promise.resolve(makeMockSnapshot())

export const onSnapshot = () => () => {}
