<script setup lang="ts">
import { collection, getDocs, query, where } from 'firebase/firestore'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirestore } from 'vuefire'
import { BackButton, InputField, Logo } from '../components'
import { localStorageKeys } from '../config/storageKeys'
import { useCurrentPlayer, useNotification } from '../stores'
import { usePlayerFields } from '../utils'

// =======================================================
// PLAYER DATA
// =======================================================

// // Referencia ao campo de senha
// const passwordField = ref<InstanceType<typeof InputField> | null>(null)

// //=== Api communication

// const loading = ref(false)
// const router = useRouter()

// /** Mostra um erro no formulario */
// const errorMessage = ref('')

// function submit() {
//   // Sempre reseta mensagem de erro
//   errorMessage.value = ''

//   // Pega os campos
//   const { nickname, password } = playerFormFields.fields

//   // If not valid, ignore
//   if (nickname.value == undefined || !nickname.isValid) {
//     errorMessage.value = 'Apelido inválido'
//     return
//   }
//   if (
//     isPasswordRequired.value &&
//     (password?.value == undefined || !password.isValid)
//   ) {
//     errorMessage.value = 'Senha inválida'
//     return
//   }

//   // Show loading sign
//   loading.value = true

//   playersApi
//     .login({ nickname: nickname.value, password: password?.value ?? '' })
//     // Se tiver sucesso, vai para pagina inicial
//     .then(() => {
//       loading.value = false
//       router.push({ name: 'home' })
//     })
//     // Em erro, temos 2 casos
//     .catch((error) => {
//       if (error.response?.status != null) {
//         const { status } = error.response

//         // Ou o jogador nao foi encontrado, com status 404
//         if (status == 404) {
//           // Neste caso, vamos para pagina de criar jogador

//           loading.value = false

//           router.push({
//             name: 'create-account',
//             params: { defaultNickname: nickname.value },
//           })

//           return
//         }

//         // Ou a senha está errada
//         if (status == 401) {
//           loading.value = false

//           // Se ele ainda não foi solicitado uma senha
//           if (isPasswordRequired.value == false) {
//             isPasswordRequired.value = true

//             // Foca no campo
//             setTimeout(() => passwordField.value?.focus(), 100)

//             return
//           }

//           // Se já foi, avisa que está incorreta
//           errorMessage.value = 'Senha incorreta'

//           return
//         }
//       }

//       throw new Error(
//         `Metodo de log in retornou erro inesperado: ${JSON.stringify(error)}`
//       )
//     })
// }

//
//
//
//
//

// Campos de login
const { email, password, getErrorForCode } = usePlayerFields(
  localStorageKeys.loginFields
)

// Nao valida formato da senha em login
password.value.validate = () => true

// ==============================
// PASSO 1 — FORNECER EMAIL
// ==============================

const router = useRouter()
const db = useFirestore()

/** Se o email foi fornecido e esta ligado a uma conta existente */
const emailConfirmed = ref(false)

/** Envia um email para confirmacao
 * Se existir, passa para o passo 2. Se nao, vai para a tela de criar conta */
const submitEmail = async () => {
  // Query do email
  const emailQuery = query(
    collection(db, 'players'),
    where('email', '==', email.value.value)
  )

  // Executa a query
  const snapshot = await getDocs(emailQuery)

  // Se nao encontrar nada, nao esta registrado
  if (snapshot.empty) {
    router.push({ name: 'create-player' })
    return
  }

  // Se encontrar, vai para passo 2
  emailConfirmed.value = true
}

/** Volta para o passo 1 */
const returnStep = () => (emailConfirmed.value = false)

// ==============================
// PASSO 2 — FORNECER SENHA
// ==============================

const { notify } = useNotification()
const { login } = useCurrentPlayer()

// Acao de login
const tryLogin = () => {
  const emailValue = email.value.value

  // Tentativa de login
  login(emailValue, password.value.value)
    // Redirect to home
    .then(() => router.push({ name: 'home' }))
    // Handle errors
    .catch(({ code, message }) => {
      console.log('Login failed! ' + message)

      notify('error', getErrorForCode(code))
    })
}

const submit = () => {
  if (formValid.value == false) return

  if (emailConfirmed.value) tryLogin()
  else submitEmail()
}

/** Se os campos estao validos */
const formValid = computed(() => emailConfirmed.value || email.value.valid)
</script>

<template>
  <div
    class="preset-gradient-background"
    :class="{ confirmed: emailConfirmed }"
  >
    <form class="preset-card">
      <!-- Back button -->
      <BackButton @click="returnStep" class="back-button" />

      <!-- Title -->
      <Logo class="logo" />

      <!-- Email -->
      <InputField
        class="input"
        v-if="emailConfirmed == false"
        variant="dark"
        name="email"
        v-model="email"
        auto-focus
      />

      <!-- Senha -->
      <template v-else>
        <!-- Mostra o email fornecido -->
        <label
          class="email-display"
          for="password"
          @click="emailConfirmed = false"
          >{{ email.value }}</label
        >

        <InputField
          class="input"
          id="password"
          name="senha"
          variant="dark"
          v-model="password"
          auto-focus
        />

        <!-- Esqueceu a senha -->
        <p id="forgot-password">Esqueceu a senha?</p>
      </template>

      <!-- Submit -->
      <button
        @click.prevent="submit"
        :class="formValid || 'disabled'"
        id="login"
      >
        <font-awesome-icon
          v-if="emailConfirmed"
          :icon="['fas', 'right-to-bracket']"
        />

        <font-awesome-icon v-else :icon="['fas', 'paper-plane']" />

        {{ emailConfirmed ? 'Entrar' : 'Enviar' }}
      </button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.logo {
  transition: 500ms ease-out;
  margin-bottom: 0.3rem;
}

.input {
  width: 100%;
}

button {
  width: 50%;
  max-width: 100%;
}

.email-display {
  font-weight: 600;
  padding: 0.4rem 1rem;
  background-color: var(--bg-trans-1);
  border-radius: $border-radius;
  transition: 100ms;
  cursor: pointer;

  margin-bottom: -0.4rem;

  &:hover {
    background-color: var(--bg-trans-3);
  }

  @include high-contrast-border;
}

#forgot-password {
  margin-block: 0.5rem -0.3rem;
}

.back-button {
  transition: all 300ms ease-out;
  font-size: 2rem;

  opacity: 0;
  translate: -2rem 0;
  pointer-events: none;
  scale: 20%;
}

.confirmed {
  .logo {
    font-size: 1.5rem;
  }

  .back-button {
    opacity: 1;
    translate: 0 0;
    pointer-events: initial;
    scale: 100%;
  }
}
</style>
