<script setup lang="ts">
import { useAdventureFields } from '@/api/adventures'
import { useAdventure } from '@/api/adventures/useAdventure'
import { Button, Typography } from '@/components'
import { Fields } from '@/components/Fields'
import { useAlert } from '@/stores'
import { sessionStorageKeys } from '@/utils/config'
import { eraseInStorage, isFieldValid } from '@/utils/functions'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import magicalPenPicture from '../../../assets/magical-pen.png'

// Campos de login
const fields = useAdventureFields({
  sessionStoragePrefix: sessionStorageKeys.createAdventureFields,
})

const { description, name, playerLimit, open, requireAdmission } = fields

const { alert } = useAlert()
const { create } = useAdventure()

/** Se os campos estao validos */
const formValid = computed(() => isFieldValid(name, description, playerLimit))

const router = useRouter()

// Acao de criar aventura
const tryCreate = () => {
  // Valida os campos
  if (formValid.value == false) return

  // Tentativa
  create({
    description: description.value,
    name: name.value,
    open: open.value,
    playerLimit: fields.shouldLimitPlayers.value ? playerLimit.value : -1,
    requireAdmission: requireAdmission.value,
  })
    .then(async (adventureId) => {
      // Redirect to home
      await router.push({ name: 'adventure', params: { adventureId } })

      // Limpa os campos armazenados localmente
      eraseInStorage(
        new RegExp(sessionStorageKeys.createAdventureFields),
        'session'
      )
    })
    // Handle errors
    .catch((error) => {
      console.error('Adventure creation failed!', error)

      alert('error', 'Ocorreu um erro, tente novamente mais tarde')
    })
}
</script>

<template>
  <form @submit.prevent="tryCreate">
    <img :src="magicalPenPicture" class="illustration" />

    <!-- Titulo da pagina -->
    <Typography variant="title" class="title">Criar aventura</Typography>

    <Typography variant="paragraph-secondary"
      >você poderá alterar essas configurações depois</Typography
    >

    <Fields
      class="fields"
      :fields="[
        fields.name,
        fields.description,
        fields.open,
        fields.requireAdmission,
        fields.shouldLimitPlayers,
        fields.shouldLimitPlayers.value && fields.playerLimit,
      ]"
      autoFocus="name"
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
  padding-inline: 1.5rem;

  .title {
    align-self: center;
  }

  .illustration {
    width: 10rem;
    align-self: center;
  }

  .fields {
    flex-direction: column;
    gap: 1.3rem;
    align-items: stretch;
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
