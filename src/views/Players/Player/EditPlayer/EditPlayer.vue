<script setup lang="ts">
import { Vase } from '@/api'
import { useCurrentPlayer, usePlayerFields } from '@/api/players'
import { Button, Divisor, Drawer, Typography } from '@/components'
import { Fields } from '@/components/Fields'
import { HalfResource } from '@/firevase/resources'
import { useAlert } from '@/stores'
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
  getErrorForCode,
  maybeInvalidateEmail,
} = usePlayerFields({ initializeWith: props.player, update })

// Campos de login
const { fields } = useAutosaveForm(
  {
    name: rawFields.name,
    nickname: rawFields.nickname,
    email: rawFields.email,
    about: rawFields.about,
  },
  {
    handleError: (error, { name }, emailValue) => {
      if (name !== 'email') return false

      const { code } = error

      alert('error', getErrorForCode(code))

      maybeInvalidateEmail(emailValue, code)

      return true
    },
  }
)

// ====================================================================================
// ALTERAR SENHA
// ====================================================================================

const extraFields = {
  currentPassword: fieldRef('senha atual', {
    initialValue: '',
    describe: () =>
      'se quiser alterar sua senha, precisamos confirmar sua senha atual',
    validator: (value) => (value.length <= 2 ? 'senha muito pequena' : true),
  }),
}

const disablePasswordChange = computed(
  () =>
    extraFields.currentPassword.validate(extraFields.currentPassword.value) !==
      true ||
    rawFields.password.validate(rawFields.password.value) !== true ||
    rawFields.passwordConfirmation.validate(
      rawFields.passwordConfirmation.value
    ) !== true
)

const auth = getAuth()

const changePassword = async () => {
  if (disablePasswordChange.value) return

  const newPassword = rawFields.password.value

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
    await update({ password: newPassword })

    alert('success', 'senha alterada com sucesso!')
  } catch {
    alert('error', 'falha ao atualizar sua senha')
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
        :fields="[fields.name, fields.nickname, fields.email, fields.about]"
      />

      <Divisor class="divisor" />

      <Fields
        class="fields"
        :fields="[
          extraFields.currentPassword,
          rawFields.password,
          rawFields.passwordConfirmation,
        ]"
      />

      <Button
        @click.prevent="changePassword"
        class="change-password-button"
        :disabled="disablePasswordChange"
        >alterar senha</Button
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
