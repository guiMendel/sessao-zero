import { db } from '@/api/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export async function checkPlayerExists(email: string) {
  // Query do email
  const emailQuery = query(
    collection(db, 'players'),
    where('email', '==', email)
  )

  // Executa a query
  return getDocs(emailQuery).then(({ empty }) => empty == false)
}
