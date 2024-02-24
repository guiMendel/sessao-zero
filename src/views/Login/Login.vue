<script setup lang="ts">
import { auth } from '@/api/firebase'
import { useCurrentPlayer, usePlayerFields } from '@/api/players'
import { GoogleIcon } from '@/assets/icons'
import {
  BackButton,
  Button,
  InputField,
  LoadingSpinner,
  Logo,
  Typography,
} from '@/components'
import { useAlert } from '@/stores'
import { sessionStorageKeys } from '@/utils/config'
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
// import { useSignInWithGoogle } from '@/utils/hooks'
import { useSignInWithGoogle } from '@/utils/hooks'
import mobileIllustration from '../../assets/illustration.png'
import desktopIllustration from '../../assets/login-art.png'
import { intoCodeError } from '@/utils/classes'

// Campos de login
const { fields } = usePlayerFields({
  storageKey: sessionStorageKeys.loginFields,
})

const { email, password } = fields

const signInWithGoogle = useSignInWithGoogle()

// Nao valida formato da senha em login
password.validate = () => true

const loading = ref(false)

// ==============================
// PASSO 1 — FORNECER EMAIL
// ==============================

const router = useRouter()

/** Se o email foi fornecido e esta ligado a uma conta existente */
const emailConfirmed = ref(false)

/** Envia um email para confirmacao
 * Se existir, passa para o passo 2. Se nao, vai para a tela de criar conta */
const submitEmail = async () => {
  loading.value = true

  const methods = await fetchSignInMethodsForEmail(auth, email.value)

  loading.value = false

  // Se nao encontrar nada, nao esta registrado
  if (methods.length === 0) {
    router.push({ name: 'create-player' })
    return
  }

  // Usuario cadastrado com google
  if (methods.includes('google.com')) return signInWithGoogle(email.value)

  // Se encontrar password, vai para passo 2
  if (methods.includes('password')) emailConfirmed.value = true
}

/** Volta para o passo 1 */
const returnStep = () => (emailConfirmed.value = false)

// ==============================
// PASSO 2 — FORNECER SENHA
// ==============================

const { alert } = useAlert()
const { login } = useCurrentPlayer()

// Acao de login
const tryLogin = () => {
  const emailValue = email.value

  // Tentativa de login
  login(emailValue, password.value)
    // Redirect to home
    .then(() => router.push({ name: 'home' }))
    // Handle errors
    .catch((error) => {
      const codeError = intoCodeError(error)

      alert('error', codeError.message)

      if (codeError.code === 'local/unknown') console.error(error)
    })
}

/** Se os campos estao validos */
const formValid = computed(
  () => emailConfirmed.value || email.validate(email.value) == true
)

const submit = () => {
  if (formValid.value == false) return

  if (emailConfirmed.value) tryLogin()
  else submitEmail()
}

const resetPassword = async () => {
  if (!email.value) return

  loading.value = true

  await sendPasswordResetEmail(auth, email.value)

  loading.value = false

  alert('success', 'email de recuperação enviado')
}
</script>

<template>
  <div class="login" :class="{ confirmed: emailConfirmed }">
    <div
      class="illustration"
      :style="{
        '--mobile-image': `url(${mobileIllustration})`,
        '--desktop-image': `url(${desktopIllustration})`,
      }"
    ></div>

    <form>
      <!-- Back button -->
      <BackButton :behavior="returnStep" class="back-button" />

      <!-- Title -->
      <Logo class="logo" />

      <template v-if="emailConfirmed == false">
        <!-- Email -->
        <InputField class="input" auto-focus :field="fields.email" />

        <!-- Enviar -->
        <Button
          @click.prevent="submit"
          variant="colored"
          :class="formValid || 'disabled'"
          id="login"
        >
          <LoadingSpinner v-if="loading" />

          <template v-else>
            <font-awesome-icon :icon="['fas', 'paper-plane']" />Enviar
          </template>
        </Button>

        <Typography variant="paragraph-secondary" class="method-separator-label"
          >ou</Typography
        >

        <Button
          @click.prevent="() => signInWithGoogle()"
          class="sign-in-with-google"
        >
          <GoogleIcon />
          entrar com google</Button
        >
      </template>

      <!-- Senha -->
      <template v-else>
        <!-- Mostra o email fornecido -->
        <Typography
          class="email-display"
          color="white"
          @click="emailConfirmed = false"
          >{{ email }}</Typography
        >

        <InputField class="input" auto-focus :field="fields.password" />

        <!-- Submit -->
        <Button
          @click.prevent="submit"
          variant="colored"
          :class="formValid || 'disabled'"
          id="login"
        >
          <LoadingSpinner v-if="loading" />

          <template v-else>
            <font-awesome-icon :icon="['fas', 'right-to-bracket']" />Entrar
          </template>
        </Button>

        <!-- Esqueceu a senha -->
        <button class="forgot-password" @click.prevent="resetPassword">
          <Typography>Esqueceu a senha?</Typography>
        </button>
      </template>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

#app .login {
  box-shadow: inset 0 0 100px 0 var(--trans-1);

  align-items: center;
  justify-content: center;
  flex-direction: column;

  width: 100%;
  height: 100vh;
  max-height: 100vh;

  background-color: var(--bg-main-washed);

  @media (min-width: 750px) {
    flex-direction: row;
    gap: 2rem;

    padding: 2rem 10%;
  }

  form {
    padding: 2rem;
    max-width: 100%;

    flex-direction: column;
    align-items: center;
    gap: 1rem;

    @media (min-width: 750px) {
      position: relative;
      flex: 0.4;
      padding: 0;

      max-width: 30rem;

      .back-button {
        top: -3rem;
      }
    }

    .back-button {
      transition: all 300ms ease-out;

      opacity: 0;
      translate: -2rem 0;
      pointer-events: none;
      // scale: 20%;
    }

    .logo {
      font-size: 2.5rem;

      transition: 200ms ease-out;
      color: var(--tx-main);
    }

    .input {
      max-width: 100%;
      width: 20rem;
    }

    .method-separator-label {
      font-weight: 800;
      color: var(--tx-main);
    }

    .sign-in-with-google {
      font-weight: 600;

      box-shadow: none;
      background-color: var(--bg-main-lighter);
      color: var(--tx-main-dark);
    }

    .email-display {
      font-weight: 600;
      padding: 0.4rem 1rem;
      background-color: var(--bg-main-lighter);
      color: var(--tx-main);
      border-radius: $border-radius;
      transition: all 100ms;
      cursor: pointer;

      margin-bottom: -0.5rem;

      &:hover {
        filter: brightness(0.98)
      }

      @include high-contrast-border;
    }

    .forgot-password {
      margin-top: 0.5rem;
      font-weight: 500;
      opacity: 0.8;
      transition: all 100ms;


      &:hover {
        background-color: var(--bg-main-lighter);
      }
    }
  }

  .illustration {
    width: 80%;
    height: 100%;

    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    background-image: var(--mobile-image);

    @media (min-width: 750px) {
      width: 100%;
      max-width: 60rem;

      flex: 0.6;

      background-image: var(--desktop-image);
    }
  }

  &.confirmed {
    .logo {
      font-size: 1.9rem;
    }

    .back-button {
      opacity: 1;
      translate: 0 0;
      pointer-events: initial;
    }
  }
}
</style>
@/api/players
