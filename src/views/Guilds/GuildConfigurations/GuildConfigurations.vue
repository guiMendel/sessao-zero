<script setup lang="ts">
import { useCurrentGuild } from '@/api/guilds'
import {
  Button,
  InputField,
  SelectField,
  ToggleField,
  Typography,
} from '@/components'
import { useAlert, useInput } from '@/stores'
import { CodeError } from '@/utils/classes'
import { fieldRef } from '@/utils/functions'
import { useAutosaveForm } from '@/utils/hooks'
import { useRouter } from 'vue-router'

const { guild, deleteForever, update } = useCurrentGuild()

if (!guild.value) throw new CodeError('local/require-guild')

const { fields } = useAutosaveForm({
  name: fieldRef('nome', {
    validator: (name) => (name.length > 2 ? true : 'Minimo de 3 caracteres'),
    initialValue: guild.value.name,
    persist: (name) => update({ name }),
  }),

  open: fieldRef('aberta', {
    initialValue: guild.value.open,
    persist: (open) => update({ open }),
  }),

  allowAdventureSubscription: fieldRef('inscrições', {
    initialValue: guild.value.allowAdventureSubscription,
    persist: (allowAdventureSubscription) =>
      update({ allowAdventureSubscription }),
  }),

  listingBehavior: fieldRef('listagem', {
    initialValue: guild.value.listingBehavior,
    persist: (listingBehavior) => update({ listingBehavior }),
  }),

  requireAdmission: fieldRef('admissão', {
    initialValue: guild.value.requireAdmission,
    persist: (requireAdmission) => update({ requireAdmission }),
  }),
})

const router = useRouter()

const { alert: notify } = useAlert()

const { getStringInput } = useInput()

const deleteGuild = () =>
  // Precisa de uma confirmaçao para excluir a guilda
  guild.value &&
  getStringInput({
    cancelValue: '',
    inputFieldName: 'nome da guilda',
    validator: (value) =>
      guild.value && value == guild.value.name ? true : 'nomes nao batem',
    submitButton: { label: 'destruir' },
    messageClass: 'guild-configurations__delete-confirmation',
    messageHtml: `\
Tem certeza de que deseja deletar a guilda permanentemente?\
<br />\
Digite <code>${guild.value.name}</code> para confirmar.`,
  })
    .then((name) => {
      if (!name) return

      deleteForever()
        .then(() => router.push({ name: 'home' }))
        .catch((error) => {
          console.error('Failed to delete guild', error)

          notify('error', 'Algo deu errado, tente novamente mais tarde')
        })
    })
    .catch(() => {})
</script>

<template>
  <div class="guild-configurations">
    <div class="section">
      <Typography class="title" variant="subtitle">Geral</Typography>

      <InputField :field="fields.name" />
    </div>

    <div class="section">
      <Typography class="title" variant="subtitle">Aventuras</Typography>

      <ToggleField
        v-model="fields.allowAdventureSubscription.value"
        :message="
          fields.allowAdventureSubscription.value
            ? 'jogadores podem se inscrever nas aventuras normalmente'
            : 'as aventuras não aceitarão novas inscrições'
        "
        >inscrições abertas</ToggleField
      >
    </div>

    <div class="section">
      <Typography class="title" variant="subtitle">Admissão</Typography>

      <ToggleField
        v-model="fields.open.value"
        :message="
          fields.open.value
            ? 'jogadores podem entrar'
            : 'nenhum novo jogador pode entrar'
        "
        >aberta</ToggleField
      >

      <SelectField
        v-model="fields.listingBehavior.value"
        :options="[
          { label: 'não listada', value: 'unlisted' },
          { label: 'publica', value: 'public' },
        ]"
        :message="
          fields.listingBehavior.value === 'public'
            ? 'sua guilda será listada publicamente e qualquer um pode solicitar acesso'
            : 'sua guilda não será listada publicamente, o acesso somente se dará por convites'
        "
      />

      <!-- Somente se visibilidade for publica -->
      <ToggleField
        v-model="fields.requireAdmission.value"
        :message="
          fields.requireAdmission.value
            ? 'quando um jogador solicitar acesso, ele somente será admitido após sua autorização'
            : 'ao solicitar acesso, jogadores serão admitidos automaticamente'
        "
        >requer admissão</ToggleField
      >
    </div>

    <div class="section danger">
      <Typography class="title" variant="subtitle">Zona de perigo</Typography>

      <!-- <Button
        variant="dark"
        message-class="guild-danger-message"
        message="a guilda se torna imodificável e inacessível para todos os demais membros"
        >arquivar</Button
      > -->

      <Button
        variant="dark"
        message-class="guild-danger-message"
        message="a guilda é destruída permanentemente, sem piedade"
        @click="deleteGuild"
        >destruir</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.guild-configurations {
  padding-inline: 1.5rem;
  flex-direction: column;
  align-items: stretch;
  gap: 3rem;
  flex: 1;
  margin-top: 2rem;

  max-width: 30rem;
  align-self: center;

  .section {
    flex-direction: column;
    gap: 0.8rem;

    // background-color: var(--bg-main-washed);
    border-radius: $border-radius;

    &.danger {
      border: 5px solid var(--bg-trans-2);
      background-color: var(--bg-error-washed);
      padding: 0.6rem 1rem;
      color: var(--tx-white);

      @include high-contrast-border;

      .title {
        color: var(--tx-trans-3);
      }
    }

    .title {
      color: var(--tx-main-dark);
    }
  }
}
</style>

<style lang="scss">
.guild-configurations .section .guild-danger-message {
  color: var(--tx-trans-3);
  font-weight: 600;
}

#app .guild-configurations__delete-confirmation {
  display: inline;

  code {
    background-color: var(--light-trans-45);
    padding: 0.2rem 0.4rem;
    line-height: 2rem;
    border-radius: 10px;
    font-weight: bold;
    font-size: 1.05rem;
  }
}
</style>
@/api/guilds
