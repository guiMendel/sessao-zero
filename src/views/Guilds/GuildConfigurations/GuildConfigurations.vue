<script setup lang="ts">
import {
  Button,
  InputField,
  SelectField,
  ToggleField,
  Typography,
} from '@/components'
import { fieldRef } from '@/utils'
import { ref } from 'vue'

// const { guild } = storeToRefs(useCurrentGuild())

// watch(guild, (guild) => {
//   name.value.value = guild.name
// })

const fields = {
  name: fieldRef('name'),
  description: fieldRef('descrição'),
}

// Visibilidade
type VisibilityOptions = 'publica' | 'não listada'
const visibility = ref<VisibilityOptions>('publica')

// Acesso
const requireAccess = ref(false)
</script>

<template>
  <div class="guild-configurations">
    <div class="section">
      <Typography variant="subtitle">Dados</Typography>

      <InputField :field="fields.name" />

      <InputField :field="fields.description" multiline />
    </div>

    <div class="section">
      <Typography variant="subtitle">Acesso</Typography>

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

    <div class="section">
      <Typography variant="subtitle">Zona de perigo</Typography>

      <Button>transferir dono</Button>

      <Button>arquivar</Button>

      <Button>destruir</Button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.guild-configurations {
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 2rem;
  flex: 1;
  margin-top: 2rem;

  .section {
    flex-direction: column;
    gap: 0.8rem;
  }
}
</style>
@/utils/types
