<script setup lang="ts">
import { checkPlayerExists, useCurrentPlayer, usePlayerFields } from '@/api'
import { BackButton, Button, InputField, Logo, Typography } from '@/components'
import { useNotification } from '@/stores'
import { localStorageKeys } from '@/utils'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import illustration from '../../assets/illustration.png'

// Campos de login
const fields = usePlayerFields(localStorageKeys.loginFields)

const { email, password, getErrorForCode } = fields

// Nao valida formato da senha em login
password.validate = () => true

// ==============================
// PASSO 1 — FORNECER EMAIL
// ==============================

const router = useRouter()

/** Se o email foi fornecido e esta ligado a uma conta existente */
const emailConfirmed = ref(false)

/** Envia um email para confirmacao
 * Se existir, passa para o passo 2. Se nao, vai para a tela de criar conta */
const submitEmail = async () => {
  // Se nao encontrar nada, nao esta registrado
  if ((await checkPlayerExists(email.value)) == false) {
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
  const emailValue = email.value

  // Tentativa de login
  login(emailValue, password.value)
    // Redirect to home
    .then(() => router.push({ name: 'home' }))
    // Handle errors
    .catch(({ code, message }) => {
      console.error('Login failed!', message)

      notify('error', getErrorForCode(code))
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
</script>

<template>
  <div class="login" :class="{ confirmed: emailConfirmed }">
    <!-- Back button -->
    <BackButton :behavior="returnStep" class="back-button" />

    <img class="illustration" :src="illustration" />

    <form>
      <!-- Title -->
      <Logo class="logo" />

      <!-- Email -->
      <InputField
        class="input"
        v-if="emailConfirmed == false"
        auto-focus
        :field="fields.email"
      />

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

        <!-- Esqueceu a senha -->
        <Typography color="white" id="forgot-password"
          >Esqueceu a senha?</Typography
        >
      </template>

      <!-- Submit -->
      <Button
        @click.prevent="submit"
        variant="colored"
        :class="formValid || 'disabled'"
        id="login"
      >
        <font-awesome-icon
          v-if="emailConfirmed"
          :icon="['fas', 'right-to-bracket']"
        />

        <font-awesome-icon v-else :icon="['fas', 'paper-plane']" />

        {{ emailConfirmed ? 'Entrar' : 'Enviar' }}
      </Button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.login {
  box-shadow: inset 0 0 100px 0 var(--trans-1);

  align-items: center;
  justify-content: center;
  flex-direction: column;

  width: 100%;
  height: 100vh;

  background-color: var(--bg-main-washed);

  form {
    padding: 2rem;
    max-width: 100%;
    position: relative;

    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .logo {
      font-size: 2.5rem;

      transition: 200ms ease-out;
      color: var(--tx-main);
    }

    .input {
      max-width: 100%;
      width: 20rem;
    }

    button {
      width: 50%;
      max-width: 100%;
    }

    .email-display {
      font-weight: 600;
      padding: 0.4rem 1rem;
      background-color: var(--bg-main-lighter);
      color: var(--tx-main);
      border-radius: $border-radius;
      transition: 100ms;
      cursor: pointer;

      margin-bottom: -0.5rem;

      &:hover {
        background-color: var(--bg-trans-3);
      }

      @include high-contrast-border;
    }

    #forgot-password {
      margin-block: 0.5rem -0.3rem;
    }
  }

  .back-button {
    transition: all 300ms ease-out;

    opacity: 0;
    translate: -2rem 0;
    pointer-events: none;
    // scale: 20%;
  }

  .illustration {
    width: 80%;
  }

  &.confirmed {
    .logo {
      font-size: 1.9rem;
    }

    .back-button {
      opacity: 1;
      translate: 0 0;
      pointer-events: initial;
      // scale: 100%;
    }
  }
}
</style>
