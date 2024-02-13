<script setup lang="ts">
import { useAdventureFields } from '@/api/adventures'
import { useAdventure } from '@/api/adventures/useAdventure'
import { InputField, ToggleField } from '@/components'
import { useAlert } from '@/stores'
import { sessionStorageKeys } from '@/utils/config'
import { eraseInStorage, isFieldValid } from '@/utils/functions'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Campos de login
const fields = useAdventureFields(sessionStorageKeys.createAdventureFields)

const enablePlayerLimit = ref(false)
</script>

<template>
  <!-- Nome -->
  <InputField autoFocus class="input" :field="fields.name" />

  <!-- Descrição -->
  <InputField
    class="input"
    :field="fields.description"
    multiline
    message="apresente e torne sua aventura interessante!"
  />

  <!-- Abertura -->
  <ToggleField
    v-model="fields.open.value"
    :message="
      fields.open.value
        ? 'sua aventura aceitará novos jogadores'
        : 'sua aventurá não aceitará jogadores ainda'
    "
    >aberta</ToggleField
  >

  <!-- Admissao -->
  <ToggleField
    v-model="fields.requireAdmission.value"
    :message="
      fields.requireAdmission.value
        ? 'jogadores enviam solicitações para entrar na aventura'
        : 'jogadores podem entrar diretamente'
    "
    >requer admissão</ToggleField
  >

  <!-- Limite de jogadores -->
  <ToggleField v-model="enablePlayerLimit">limitar jogadores</ToggleField>

  <InputField
    v-if="enablePlayerLimit"
    class="input"
    :field="fields.playerLimit"
    message="quando atingir o limite, novos jogadores não poderão entrar"
    :min="1"
  />
</template>
