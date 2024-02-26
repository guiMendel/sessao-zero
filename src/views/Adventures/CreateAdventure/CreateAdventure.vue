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
import writingPicture from '@/assets/writing.png'
import { setFile } from '@/firevase/files'
import { Vase } from '@/api'

// Campos de login
const fields = useAdventureFields({
  sessionStoragePrefix: sessionStorageKeys.createAdventureFields,
})

const { description, name, playerLimit, open, requireAdmission } = fields

const { alert } = useAlert()
const { create, get } = useAdventure()

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
      const adventure = await get(adventureId)

      // Adiciona a capa
      if (fields.banner.value && adventure)
        setFile<Vase, 'adventures'>(adventure, 'banner', fields.banner.value)

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
  <div class="create-adventure">
    <div class="banner">
      <Typography variant="title" class="title">Criar aventura</Typography>

      <Typography>você poderá alterar essas configurações depois</Typography>

      <img :src="writingPicture" class="writing-illustration" />
    </div>

    <form @submit.prevent="tryCreate">
      <div class="hide-desktop">
        <img :src="magicalPenPicture" class="pen-illustration" />

        <!-- Titulo da pagina -->
        <Typography variant="title" class="title">Criar aventura</Typography>

        <Typography variant="paragraph-secondary"
          >você poderá alterar essas configurações depois</Typography
        >
      </div>

      <Fields
        class="fields"
        :fields="[
          fields.banner,
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
      <Button
        :disabled="!formValid"
        id="login"
        class="submit"
        variant="colored"
      >
        <font-awesome-icon :icon="['fas', 'signature']" />

        criar
      </Button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

#app .create-adventure {
  width: 100%;

  align-items: center;
  justify-content: center;
  padding-inline: 1.5rem;
  gap: 4rem;

  .banner {
    display: none;
    flex-direction: column;

    align-items: center;
    gap: 2rem;

    .title {
      font-size: 2rem;
      margin-bottom: -1rem;
    }

    .writing-illustration {
      max-width: 100%;
    }

    @media (min-width: 700px) {
      display: flex;
      flex: 0.8;
      max-width: 30rem;
    }
  }

  form {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    flex: 1;

    max-width: 30rem;

    .hide-desktop {
      @media (min-width: 700px) {
        display: none;
      }
    }

    .title {
      align-self: center;
    }

    .pen-illustration {
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
}
</style>
