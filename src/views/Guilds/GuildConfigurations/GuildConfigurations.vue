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

// watch(guild, (guild) => {
//   name.value.value = guild.name
// })

// Proximo passo: popular os dados dessa pagina com os reais dados da guilda atual.
// Em seguida, trazer funcionalidade real para a UI para permitir editar e excluir a guilda

const { fields, status } = useAutosaveForm({
  name: fieldRef('nome', {
    validator: (name) => (name.length > 2 ? true : 'Minimo de 3 caracteres'),
    initialValue: guild.value.name,
    persist: (name) => update({ name }),
  }),
  description: fieldRef('descrição'),
})

// Visibilidade
type VisibilityOptions = 'publica' | 'não listada'
const visibility = ref<VisibilityOptions>('publica')

// Acesso
const requireAccess = ref(false)
</script>

<template>
  <div class="guild-configurations">
    <Typography>Status: {{ status }}</Typography>

    <div class="section">
      <Typography variant="subtitle">Geral</Typography>

      <InputField :field="fields.name" />

      <InputField :field="fields.description" multiline />
    </div>

    <div class="section">
      <Typography variant="subtitle">Admissão</Typography>

      <SelectField
        label="visibilidade"
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
        label="acesso"
        :message="
          requireAccess
            ? 'quando um jogador solicitar acesso, ele somente será admitido após sua autorização'
            : 'ao solicitar acesso, jogadores serão admitidos automaticamente'
        "
        >requer autorização</ToggleField
      >
    </div>

    <div class="section danger">
      <Typography variant="subtitle">Zona de perigo</Typography>

      <Button
        message="abdicar da administração da guilda e a transferir para outro jogador"
        >transferir dono</Button
      >

      <Button
        message="a guilda se torna imodificável e inacessível para todos os demais membros"
        >arquivar</Button
      >

      <Button message="a guilda é destruída permanentemente, sem piedade"
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
  gap: 1rem;
  flex: 1;
  margin-top: 2rem;

  .section {
    flex-direction: column;
    gap: 0.8rem;

    background-color: var(--bg-main-washed);
    border-radius: $border-radius;
    padding: 0.6rem 1rem;

    &.danger {
      background-color: var(--bg-error-washed);
    }
  }
}
</style>
@/utils/types
