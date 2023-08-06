<script setup lang="ts">
import { InputField, Logo } from '@/components'
import { localStorageKeys } from '@/config/storageKeys'
import { useCurrentPlayer, useNotification } from '@/stores'
import { eraseInStorage, usePlayerFields } from '@/utils'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Campos de login
const {
  email,
  password,
  name,
  nickname,
  passwordConfirmation,
  getErrorForCode,
  maybeInvalidateEmail,
} = usePlayerFields(localStorageKeys.loginFields)

const { notify } = useNotification()
const { create } = useCurrentPlayer()
const router = useRouter()

/** Se os campos estao validos */
const formValid = computed(
  () =>
    name.value.valid &&
    nickname.value.valid &&
    email.value.valid &&
    password.value.valid &&
    passwordConfirmation.value.valid
)

// Acao de criar jogador
const tryCreate = () => {
  // Valida os campos
  if (formValid.value == false) return

  const emailValue = email.value.value

  // Tentativa
  create({
    email: emailValue,
    password: password.value.value,
    name: name.value.value,
    nickname: nickname.value.value,
  })
    .then(async () => {
      // Redirect to home
      await router.push({ name: 'home' })

      // Limpa os campos armazenados localmente
      eraseInStorage(new RegExp(localStorageKeys.loginFields))
    })
    // Handle errors
    .catch(({ code, message }) => {
      console.log('Player creation failed! ' + message)

      notify('error', getErrorForCode(code))

      maybeInvalidateEmail(emailValue, code)
    })
}
</script>

<template>
  <div class="preset-gradient-background">
    <form class="preset-card" @submit.prevent="tryCreate">
      <Logo class="logo" />

      <!-- Titulo -->
      <font-awesome-icon class="player-icon" :icon="['fas', 'street-view']" />
      <h1>Criar Jogador</h1>

      <!-- Nome -->
      <InputField class="input" variant="dark" v-model="name" />
      <label for="nome">Como você se chama</label>

      <!-- Apelido -->
      <InputField class="input" variant="dark" v-model="nickname" />
      <label for="nome">Como seu perfil aparecerá aos outros</label>

      <!-- Email -->
      <InputField class="input" variant="dark" v-model="email" />

      <!-- Senha -->
      <InputField class="input" variant="dark" v-model="password" />

      <!-- Confirmacao de senha -->
      <InputField class="input" variant="dark" v-model="passwordConfirmation" />

      <!-- Submit -->
      <button :class="formValid || 'disabled'" id="login">
        <font-awesome-icon :icon="['fas', 'person-rays']" />

        Criar
      </button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.logo {
  margin-block: -0.5rem 1rem;
  font-size: 1.5rem;
}

.player-icon {
  font-size: 4rem;
}

.input {
  width: 100%;
}

label {
  margin-top: -1rem;
  text-transform: lowercase;
  font-size: 0.9rem;
  opacity: 0.7;

  .high-contrast & {
    opacity: 1;
  }
}

button {
  margin-top: 1rem;

  width: 50%;
  max-width: 100%;
}
</style>
