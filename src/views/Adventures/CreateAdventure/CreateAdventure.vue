<script setup lang="ts">
import { useAdventureFields } from '@/api/adventures'
import { useAdventure } from '@/api/adventures/useAdventure'
import { Button, InputField, ToggleField, Typography } from '@/components'
import { useAlert } from '@/stores'
import { sessionStorageKeys } from '@/utils/config'
import { eraseInStorage, isFieldValid } from '@/utils/functions'
import { computed, ref } from 'vue'
import magicalPenPicture from '../../../assets/magical-pen.png'

// Campos de login
const fields = useAdventureFields(sessionStorageKeys.createAdventureFields)

const { description, name, playerLimit, open, requireAdmission } = fields

const enablePlayerLimit = ref(false)

const { alert } = useAlert()
const { create } = useAdventure()

/** Se os campos estao validos */
const formValid = computed(() => isFieldValid(name, description, playerLimit))

// Acao de criar aventura
const tryCreate = () => {
  // Valida os campos
  if (formValid.value == false) return

  // Tentativa
  create({
    description: description.value,
    name: name.value,
    open: open.value,
    playerLimit: enablePlayerLimit.value ? playerLimit.value : -1,
    requireAdmission: requireAdmission.value,
  })
    .then(async () => {
      // Redirect to home
      // await router.push({ name: 'home' })

      // Limpa os campos armazenados localmente
      eraseInStorage(new RegExp(sessionStorageKeys.createAdventureFields))
    })
    // Handle errors
    .catch((error) => {
      console.error('Adventure creation failed!', error)

      alert('error', 'Ocorreu um erro, tente novamente mais tarde')
    })
}

// TODO: consertar aquele erro no input com numero
// TODO: fazer aparecer setas no input de numero
</script>

<template>
  <form @submit.prevent="tryCreate">
    <img :src="magicalPenPicture" class="illustration" />

    <!-- Titulo da pagina -->
    <Typography variant="title" class="title">Criar aventura</Typography>

    <Typography variant="paragraph-secondary"
      >você poderá alterar essas configurações depois</Typography
    >

    <!-- Nome -->
    <InputField autoFocus class="input" :field="fields.name" />

    <!-- Descrição -->
    <InputField
      class="input"
      :field="fields.description"
      multiline
      message="apresente e torne sua aventura interessante!"
    />

    <ToggleField
      v-model="fields.open.value"
      :message="
        fields.open.value
          ? 'sua aventura aceitará novos jogadores'
          : 'sua aventurá não aceitará jogadores ainda'
      "
      >aberta</ToggleField
    >

    <ToggleField
      v-model="fields.requireAdmission.value"
      :message="
        fields.requireAdmission.value
          ? 'jogadores enviam solicitações para entrar na aventura'
          : 'jogadores podem entrar diretamente'
      "
      >requer admissão</ToggleField
    >

    <ToggleField v-model="enablePlayerLimit">limitar jogadores</ToggleField>

    <!-- Descrição -->
    <InputField
      v-if="enablePlayerLimit"
      class="input"
      :field="fields.playerLimit"
      message="quando atingir o limite, novos jogadores não poderão entrar"
      :min="1"
    />

    <!-- Submit -->
    <Button :disabled="!formValid" id="login" class="submit" variant="colored">
      <font-awesome-icon :icon="['fas', 'signature']" />

      criar
    </Button>
  </form>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

form {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  .title {
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

  .adventure-icon {
    font-size: 4rem;
  }
}
</style>
