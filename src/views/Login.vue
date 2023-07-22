<script setup lang="ts">
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirestore } from 'vuefire'
import InputField from '../components/InputField.vue'
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
const { email, password, getErrorForCode } = usePlayerFields()

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
  console.log('submit email')

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

// ==============================
// PASSO 2 — FORNECER SENHA
// ==============================

const { notify } = useNotification()
const { login } = useCurrentPlayer()

// Acao de login
const tryLogin = () => {
  console.log('login')

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
  if (emailConfirmed.value) tryLogin()
  else submitEmail()
}
</script>

<template>
  <main :class="{ confirmed: emailConfirmed }">
    <form class="login">
      <!-- Back button -->
      <p>seta pa volta</p>
      
      <!-- Title -->
      <h1>Sessão Zero</h1>

      <!-- Email -->
      <InputField
        class="input"
        v-if="emailConfirmed == false"
        variant="dark"
        name="email"
        v-model="email"
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
          name="password"
          variant="dark"
          v-model="password"
        />

        <!-- Esqueceu a senha -->
        <p id="forgot-password">Esqueceu a senha?</p>
      </template>

      <!-- Submit -->
      <button
        @click.prevent="submit"
        :class="email.valid || 'disabled'"
        id="login"
      >
        {{ emailConfirmed ? 'Entrar' : 'Enviar' }}
      </button>
    </form>
  </main>
</template>

<style lang="scss" scoped>
@import '../styles/variables.scss';

main {
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;

  color: var(--tx-white);
  background-color: var(--bg-main);

  position: relative;

  &::before {
    content: '';
    position: absolute;

    width: 100%;
    height: 100%;

    top: 0;
    left: 0;

    background: linear-gradient(
      127deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(255, 0, 60, 0.6) 100%
    );
  }

  .login {
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    background-color: var(--bg-trans-1);

    border-radius: $border-radius;
    padding: 2rem 2rem 3rem;
    box-shadow: 0 1px 2px 3px var(--bg-trans-03);

    z-index: 10;

    h1 {
      font-family: 'Titan One', cursive;
      font-size: 2rem;
      transition: 800ms;
    }

    .input {
      width: 100%;
    }

    button {
      width: 50%;
      max-width: 100%;

      background-color: var(--bg-trans-03);
      font-weight: 900;
      text-transform: lowercase;

      box-shadow: 0 2px 0 1px var(--trans-3);
    }

    .email-display {
      font-weight: 600;
      padding: 0.4rem 1rem;
      background-color: var(--bg-trans-1);
      border-radius: $border-radius;
    }
  }

  &.confirmed {
    h1 {
      transform: scale(0.7);
    }
  }
}

.high-contrast {
  main::before {
    background: var(--accessibility-background);
  }
}
</style>
