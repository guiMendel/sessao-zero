import { auth } from '@/api/firebase'
import { useCurrentPlayer } from '@/api/players'
import { useAlert } from '@/stores'
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  signInWithPopup,
} from 'firebase/auth'

export const useSignInWithGoogle = () => {
  const { authProviderData } = useCurrentPlayer()
  const { alert } = useAlert()

  return async (email?: string) => {
    const provider = new GoogleAuthProvider()

    if (email) provider.setCustomParameters({ login_hint: email })

    try {
      const result = await signInWithPopup(auth, provider)

      if (!authProviderData.value) authProviderData.value = {}

      const additionalInfo = getAdditionalUserInfo(result)

      if (additionalInfo?.username)
        authProviderData.value.nickname = additionalInfo.username

      const googleProfile = getAdditionalUserInfo(result)?.profile

      if (!googleProfile) return

      if ('email' in googleProfile)
        authProviderData.value.email = googleProfile.email as string

      if ('email' in googleProfile)
        authProviderData.value.email = googleProfile.email as string

      if ('name' in googleProfile)
        authProviderData.value.name = googleProfile.name as string

      if ('picture' in googleProfile)
        authProviderData.value.oauthProfilePicture =
          googleProfile.picture as string
    } catch (error) {
      console.error(error)

      alert('error', 'erro, tente novamente mais tarde')
    }
  }
}
