<script setup lang="ts">
import { Vase } from '@/api'
import { useCurrentPlayer, usePlayerFields } from '@/api/players'
import { Button, Divisor, Drawer, Typography } from '@/components'
import { Fields } from '@/components/Fields'
import { HalfResource } from '@/firevase/resources'
import { useAlert } from '@/stores'
import { intoCodeError } from '@/utils/classes'
import { fieldRef } from '@/utils/functions'
import { useAutosaveForm } from '@/utils/hooks'
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  player: HalfResource<Vase, 'players'>
}>()

const emit = defineEmits(['update:modelValue'])
const { update } = useCurrentPlayer()
const { alert } = useAlert()

const {
  fields: rawFields,
  maybeInvalidateEmail,
  handleAutosaveError,
} = usePlayerFields({ initializeWith: props.player, update })

// Campos de login
const { fields } = useAutosaveForm(
  {
    name: rawFields.name,
    nickname: rawFields.nickname,
    about: rawFields.about,
  },
  {
    handleError: handleAutosaveError,
  }
)

rawFields.password.name = 'senha nova'
rawFields.email.describe = () => ''

// ====================================================================================
// ALTERAR SENHA
// ====================================================================================

const extraFields = {
  currentPassword: fieldRef('senha atual', {
    initialValue: '',
    validator: (value) => (value.length <= 2 ? 'senha muito pequena' : true),
  }),
}

const disableSensitiveSubmit = computed(
  () =>
    extraFields.currentPassword.validate(extraFields.currentPassword.value) !==
      true ||
    ((rawFields.password.validate(rawFields.password.value) !== true ||
      rawFields.passwordConfirmation.validate(
        rawFields.passwordConfirmation.value
      ) !== true) &&
      rawFields.email.validate(rawFields.email.value) !== true)
)

const auth = getAuth()

const submitSensitiveData = async () => {
  if (disableSensitiveSubmit.value) return

  const newPassword = rawFields.password.value
  const newEmail = rawFields.email.value

  const user = auth.currentUser

  if (!user) {
    console.error('Nenhum usuario encontrado no firebase')

    return
  }

  try {
    const credential = EmailAuthProvider.credential(
      props.player.email,
      extraFields.currentPassword.value
    )

    await reauthenticateWithCredential(user, credential)
  } catch (error) {
    alert('error', 'senha incorreta')

    return
  }

  try {
    if (newPassword) await update({ password: newPassword })

    if (newEmail) await update({ email: newEmail })

    alert('success', 'dados alterados com sucesso!')
  } catch (error) {
    const codeError = intoCodeError(error)

    alert('error', codeError.message)

    if (codeError.code === 'local/unknown') {
      console.error(error)

      return
    }

    maybeInvalidateEmail(newEmail, codeError.code)
  }
}
</script>

<template>
  <Drawer
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    draw-direction="bottom"
  >
    <form class="edit-player">
      <!-- Titulo da pagina -->
      <Typography variant="subtitle" class="title">Editar jogador</Typography>

      <Fields
        class="fields"
        :fields="[fields.name, fields.nickname, fields.about]"
      />

      <Typography variant="paragraph-secondary"
        >os campos acima são salvos automaticamente</Typography
      >

      <Divisor class="divisor" />

      <Typography>para estes dados, precisaremos da sua senha atual</Typography>

      <Fields
        class="fields"
        :fields="[
          extraFields.currentPassword,
          rawFields.email,
          rawFields.password,
          rawFields.passwordConfirmation,
        ]"
      />

      <Button
        @click.prevent="submitSensitiveData"
        class="change-password-button"
        :disabled="disableSensitiveSubmit"
        >alterar</Button
      >
    </form>
  </Drawer>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.edit-player {
  margin-top: -2rem;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  .fields {
    flex-direction: column;
    align-items: inherit;
    gap: 1.5rem;
  }

  .divisor {
    margin-block: 2rem 1rem;
    color: var(--tx-main);
  }

  .change-password-button {
    margin-top: 1.5rem;
  }
}
</style>
