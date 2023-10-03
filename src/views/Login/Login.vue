<script setup lang="ts">
import { BackButton, InputField, Logo, Typography } from '@/components'
import { localStorageKeys } from '@/config/storageKeys'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentPlayer, useNotification } from '@/stores'
import { checkPlayerExists, usePlayerFields } from '@/utils'

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

/** Se o email foi fornecido e esta ligado a uma conta existente */
const emailConfirmed = ref(false)

/** Envia um email para confirmacao
 * Se existir, passa para o passo 2. Se nao, vai para a tela de criar conta */
const submitEmail = async () => {
  // Se nao encontrar nada, nao esta registrado
  if ((await checkPlayerExists(email.value.value)) == false) {
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
        <!-- <label
          class="email-display"
          for="password"
          @click="emailConfirmed = false"
          >{{ email.value }}</label
        > -->
        <Typography
          class="email-display"
          color="white"
          @click="emailConfirmed = false"
          >{{ email.value }}</Typography
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
        <Typography color="white" id="forgot-password"
          >Esqueceu a senha?</Typography
        >
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
@import '@/styles/variables.scss';

.logo {
  transition: 500ms ease-out;
  margin-bottom: 0.3rem;
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
