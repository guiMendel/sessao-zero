<script setup lang="ts">
import { Button, InputField, ToggleField, Typography } from '@/components'
import { fieldRef } from '@/utils'

// const { guild } = storeToRefs(useCurrentGuild())

// const name = ref<Field>({ name: 'nome', valid: true, value: '' })
// const description = ref<Field>({ name: 'descrição', valid: true, value: '' })

// watch(guild, (guild) => {
//   name.value.value = guild.name
// })

const fields = {
  name: fieldRef('name'),
  description: fieldRef('descrição'),
}

// const name = fieldRef('name')
</script>

<template>
  <div class="guild-configurations">
    <Typography variant="subtitle">Dados</Typography>

    <InputField :field="fields.name" />

    <InputField :field="fields.description" multiline />

    <Typography variant="subtitle">Acesso</Typography>

    <div class="visibility">
      <Typography>Visibilidade</Typography>
      <select>
        <option value="public">publica</option>
        <option value="private">nao listada</option>
      </select>
    </div>

    <Typography
      :style="{
        'margin-top': '-1rem',
      }"
      variant="paragraph-secondary"
      >Sua guilda sera listada publicamente e qualquer um pode tentar
      entrar</Typography
    >

    <!-- Somente se visibilidade for publica -->
    <ToggleField>requer admissao</ToggleField>

    <Typography
      :style="{
        'margin-top': '-1rem',
      }"
      variant="paragraph-secondary"
      >Quando um jogador solicitar acesso, ele somente sera admitido apos sua
      autorizacao</Typography
    >

    <Typography variant="subtitle">Zona de perigo</Typography>

    <Button>transferir dono</Button>

    <Button>arquivar</Button>

    <Button>destruir</Button>
  </div>
</template>

<style lang="scss" scoped>
.guild-configurations {
  width: 100%;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  flex: 1;
  margin-top: 2rem;
}
</style>
@/utils/types