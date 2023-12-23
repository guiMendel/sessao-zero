<script setup lang="ts">
import { useCurrentPlayer, usePlayerFields } from '@/api/resourcePaths/players'
import { Button, InputField, Typography } from '@/components'
import { useNotification } from '@/stores'
import { localStorageKeys } from '@/utils/config'
import { eraseInStorage, isFieldValid } from '@/utils/functions'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import newPlayerArt from '../../../assets/new-player.png'

// Campos de login
const fields = usePlayerFields(localStorageKeys.loginFields)

const {
  email,
  password,
  name,
  nickname,
  passwordConfirmation,
  getErrorForCode,
  maybeInvalidateEmail,
} = fields

const { notify } = useNotification()
const { create } = useCurrentPlayer()
const router = useRouter()

/** Se os campos estao validos */
const formValid = computed(() =>
  isFieldValid(name, nickname, email, password, passwordConfirmation)
)

// Acao de criar jogador
const tryCreate = () => {
  // Valida os campos
  if (formValid.value == false) return

  const emailValue = email.value

  // Tentativa
  create({
    email: emailValue,
    password: password.value,
    name: name.value,
    nickname: nickname.value,
  })
    .then(async () => {
      // Redirect to home
      await router.push({ name: 'home' })

      // Limpa os campos armazenados localmente
      eraseInStorage(new RegExp(localStorageKeys.loginFields))
    })
    // Handle errors
    .catch(({ code, message }) => {
      console.error('Player creation failed!', message)

      notify('error', getErrorForCode(code))

      maybeInvalidateEmail(emailValue, code)
    })
}
</script>

<template>
  <form @submit.prevent="tryCreate">
    <img :src="newPlayerArt" class="illustration" />

    <!-- Titulo -->
    <Typography variant="title" color="white">Criar Jogador</Typography>

    <!-- Nome -->
    <InputField
      class="input"
      :field="fields.name"
      message="Como você se chama"
    />

    <!-- Apelido -->
    <InputField
      class="input"
      :field="fields.nickname"
      message="Como seu perfil aparecerá aos outros"
    />

    <!-- Email -->
    <InputField class="input" :field="fields.email" />

    <!-- Senha -->
    <InputField class="input" :field="fields.password" isNewPassword />

    <!-- Confirmacao de senha -->
    <InputField
      class="input"
      :field="fields.passwordConfirmation"
      isNewPassword
    />

    <!-- Submit -->
    <Button :disabled="!formValid" id="login" class="submit" variant="colored">
      <font-awesome-icon :icon="['fas', 'person-rays']" />

      criar
    </Button>
  </form>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

form {
  width: 100%;
  min-height: 100vh;

  background-color: var(--bg-main-washed);

  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;

  max-width: 100%;

  .illustration {
    width: 10rem;
  }

  .submit {
    width: 100%;
    margin-top: 1rem;
  }

  .player-icon {
    font-size: 4rem;
  }
}
</style>
@/api/players