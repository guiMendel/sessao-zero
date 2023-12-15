import { makeMockSnapshot } from '../utils'
import type { DocumentSnapshot } from 'firebase/firestore'

export const getFirestore = () => ({})

export const collection = () => ({})

export const doc = (babab: any, id: string) => ({ id })

export const query = () => ({})

export const where = () => ({})

export const setDoc = () => Promise.resolve({})

export const updateDoc = () => Promise.resolve({})

export const deleteDoc = () => Promise.resolve()

export const addDoc = () => Promise.resolve({})

export const getDoc = () => Promise.resolve(makeMockSnapshot())

export const getDocs = () => Promise.resolve(makeMockSnapshot())

export const onSnapshot = (
  target: any,
  callback: (snapshot: Partial<DocumentSnapshot>) => void
) => {
  if (target?.id in onSnapshotSendData)
    callback({ id: target.id, data: () => onSnapshotSendData[target.id] })

  return () => {}
}

export const onSnapshotSendData: Record<string, any> = {}
