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
import { ref } from 'vue'

const currentGuild = useCurrentGuild()
const { guild } = storeToRefs(currentGuild)
const { update } = currentGuild

const { fields } = useAutosaveForm({
  name: fieldRef('nome', {
    validator: (name) => (name.length > 2 ? true : 'Minimo de 3 caracteres'),
    initialValue: guild.value.name,
    persist: (name) => update({ name }),
  }),
  description: fieldRef('descrição'),
})

// Aventuras
const lockAdventureSubscription = ref(true)

// Visibilidade
type VisibilityOptions = 'publica' | 'não listada'
const visibility = ref<VisibilityOptions>('publica')

// Acesso
const requireAccess = ref(false)
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
        v-model="lockAdventureSubscription"
        :message="
          lockAdventureSubscription
            ? 'jogadores podem se inscrever nas aventuras normalmente'
            : 'as aventuras não aceitarão novas inscrições'
        "
        >inscrições abertas</ToggleField
      >
    </div>

    <div class="section">
      <Typography class="title" variant="subtitle">Admissão</Typography>

      <SelectField
        v-model="visibility"
        :options="['não listada', 'publica']"
        :message="
          visibility === 'publica'
            ? 'sua guilda será listada publicamente e qualquer um pode solicitar acesso'
            : 'sua guilda não será listada publicamente, o acesso somente se dará por convites'
        "
      />

      <!-- Somente se visibilidade for publica -->
      <ToggleField
        v-model="requireAccess"
        :message="
          requireAccess
            ? 'quando um jogador solicitar acesso, ele somente será admitido após sua autorização'
            : 'ao solicitar acesso, jogadores serão admitidos automaticamente'
        "
        >requer autorização</ToggleField
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
