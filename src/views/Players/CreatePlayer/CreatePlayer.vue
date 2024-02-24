<script setup lang="ts">
import { useCurrentPlayer, usePlayerFields } from '@/api/players'
import { Button, Typography } from '@/components'
import { Fields } from '@/components/Fields'
import { useAlert } from '@/stores'
import { intoCodeError } from '@/utils/classes'
import { sessionStorageKeys } from '@/utils/config'
import { eraseInStorage, isFieldValid } from '@/utils/functions'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import newPlayerArt from '../../../assets/new-player.png'

// Campos de login
const { fields, maybeInvalidateEmail, maybeInvalidateNickname } =
  usePlayerFields({
    storageKey: sessionStorageKeys.loginFields,
  })

const { email, password, name, nickname, passwordConfirmation } = fields

const { alert } = useAlert()
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
  const nicknameValue = nickname.value

  // Tentativa
  create({
    email: emailValue,
    password: password.value,
    name: name.value,
    nickname: nicknameValue,
    preferredGuildId: null,
  })
    .then(async () => {
      // Redirect to home
      await router.push({ name: 'home' })

      // Limpa os campos armazenados localmente
      eraseInStorage(new RegExp(sessionStorageKeys.loginFields))
    })
    // Handle errors
    .catch((error) => {
      const codeError = intoCodeError(error)

      alert('error', codeError.message)

      if (codeError.code === 'local/unknown') {
        console.error(error)

        return
      }

      maybeInvalidateEmail(emailValue, codeError.code)
      maybeInvalidateNickname(nicknameValue, codeError.code)
    })
}
</script>

<template>
  <form @submit.prevent="tryCreate">
    <div class="group background">
      <img :src="newPlayerArt" class="illustration" />

      <!-- Titulo -->
      <Typography class="heading" variant="title" color="white"
        >Criar Jogador</Typography
      >
    </div>

    <div class="group ">
      <Fields
        class="fields"
        :fields="[
          fields.name,
          fields.nickname,
          fields.email,
          fields.password,
          fields.passwordConfirmation,
        ]"
      />

      <!-- Submit -->
      <Button
        :disabled="!formValid"
        id="login"
        class="submit"
        variant="colored"
      >
        <font-awesome-icon :icon="['fas', 'person-rays']" />

        criar
      </Button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

form {
  width: 100%;
  min-height: 100vh;

  background-color: var(--bg-main-washed);

  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;

  max-width: 100%;

  @media (min-width: 700px) {
    flex-direction: row;
    align-items: center;
    gap: 3rem;

    .group {
      &.background {
        background-color: var(--bg-main-lighter);
        padding: 1rem 2rem;
        border-radius: $border-radius;
        align-self: stretch;
        justify-content: center;
      }

      .illustration {
        width: 15rem;
      }

      .heading {
        font-size: 2.3rem;
      }
    }
  }

  .group {
    flex-direction: column;
    gap: 1rem;
  }

  .fields {
    flex-direction: column;
    gap: inherit;
    align-items: stretch;
  }

  .heading {
    align-self: center;
  }

  .illustration {
    width: 10rem;
    align-self: center;
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
