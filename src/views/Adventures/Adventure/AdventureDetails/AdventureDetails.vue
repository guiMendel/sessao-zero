<script setup lang="ts">
import { isNarrator } from '@/api/adventures'
import { useCurrentAdventure } from '@/api/adventures/useCurrentAdventure'
import { useCurrentPlayer } from '@/api/players'
import { Button, Typography } from '@/components'
import { useInput } from '@/stores'
import { ref, toValue } from 'vue'
import { useRouter } from 'vue-router'
import { EditAdventure } from '../EditAdventure'

const { player } = useCurrentPlayer()

const { getStringInput } = useInput()
const router = useRouter()
const { adventure, deleteForever } = useCurrentAdventure()

const showEditPanel = ref(false)

const startEdit = () => {
  if (
    !player.value ||
    !adventure.value ||
    !isNarrator(player.value.id, adventure.value)
  )
    return

  showEditPanel.value = true
}

const destroy = async () => {
  if (
    !player.value ||
    !adventure.value ||
    !isNarrator(player.value.id, adventure.value)
  )
    return

  const confirmDestruction = await getStringInput({
    cancelValue: '',
    inputFieldName: 'nome da aventura',
    validator: (value) =>
      adventure.value && value === adventure.value.name
        ? true
        : 'nomes nao batem',
    submitButton: { label: 'destruir' },
    messageClass: 'guild-configurations__delete-confirmation',
    messageHtml: `\
Tem certeza de que deseja destruir a aventura permanentemente?\
<br />\
Digite <code>${adventure.value.name}</code> para confirmar.`,
  })

  if (!confirmDestruction || !adventure.value) return

  await deleteForever()

  router.push({ name: 'home' })
}
</script>

<template>
  <div class="details" v-if="adventure && player">
    <EditAdventure
      v-if="adventure"
      :key="adventure.id"
      :adventure="adventure"
      v-model="showEditPanel"
    />

    <!-- Descricao -->
    <Typography class="description">{{ adventure.description }}</Typography>

    <!-- Narradores -->
    <Typography variant="paragraph-secondary" class="narrators-label"
      >narrado por</Typography
    >

    <Typography class="narrators">{{
      toValue(adventure.narrators)
        .map((narrator) => narrator.nickname)
        .join(', ')
    }}</Typography>

    <!-- Acoes de narrador -->
    <div class="narrator-actions">
      <!-- Editar -->
      <Button
        variant="colored"
        class="edit-button"
        v-if="isNarrator(player.id, adventure)"
        @click="startEdit"
      >
        <font-awesome-icon :icon="['fas', 'feather-pointed']" />editar</Button
      >

      <!-- Deletar -->
      <Button
        class="delete-button"
        v-if="isNarrator(player.id, adventure)"
        @click="destroy"
      >
        <font-awesome-icon :icon="['fas', 'fire']" />excluir</Button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.details {
  padding-top: 1rem;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;

  .narrators-label {
    color: var(--tx-main-light);
    font-weight: 500;
    margin-bottom: -0.7rem;
  }

  .narrators {
    font-weight: 700;
  }

  .narrator-actions {
    margin-top: 0.5rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
}
</style>
