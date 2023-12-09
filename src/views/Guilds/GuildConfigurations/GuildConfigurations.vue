<script setup lang="ts">
import {
  Button,
  InputField,
  SelectField,
  ToggleField,
  Typography,
} from '@/components'
import { useCurrentGuild } from '@/stores'
import { fieldRef, useAutosaveForm } from '@/utils'
import { storeToRefs } from 'pinia'

const currentGuild = useCurrentGuild()
const { guild } = storeToRefs(currentGuild)
const { update } = currentGuild

const { fields } = useAutosaveForm({
  name: fieldRef('nome', {
    validator: (name) => (name.length > 2 ? true : 'Minimo de 3 caracteres'),
    initialValue: guild.value.name,
    persist: (name) => update({ name }),
  }),

  allowAdventureSubscription: fieldRef('inscrições', {
    initialValue: guild.value.allowAdventureSubscription,
    persist: (allowAdventureSubscription) =>
      update({ allowAdventureSubscription }),
  }),

  visibility: fieldRef('visibilidade', {
    initialValue: guild.value.visibility,
    persist: (visibility) => update({ visibility }),
  }),

  requireAdmission: fieldRef('admissão', {
    initialValue: guild.value.requireAdmission,
    persist: (requireAdmission) => update({ requireAdmission }),
  }),
})
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
          fields.allowAdventureSubscription
            ? 'jogadores podem se inscrever nas aventuras normalmente'
            : 'as aventuras não aceitarão novas inscrições'
        "
        >inscrições abertas</ToggleField
      >
    </div>

    <div class="section">
      <Typography class="title" variant="subtitle">Admissão</Typography>

      <SelectField
        v-model="fields.visibility.value"
        :options="['não listada', 'publica']"
        :message="
          fields.visibility.value === 'public'
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

      <Button
        variant="dark"
        message-class="guild-danger-message"
        message="a guilda se torna imodificável e inacessível para todos os demais membros"
        >arquivar</Button
      >

      <Button
        variant="dark"
        message-class="guild-danger-message"
        message="a guilda é destruída permanentemente, sem piedade"
        >destruir</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.guild-configurations {
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 3rem;
  flex: 1;
  margin-top: 2rem;

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
</style>
