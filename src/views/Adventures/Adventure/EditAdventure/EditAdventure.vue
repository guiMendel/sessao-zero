<script setup lang="ts">
import { Vase } from '@/api'
import { useAdventure, useAdventureFields } from '@/api/adventures'
import { Drawer, Typography } from '@/components'
import { Fields } from '@/components/Fields'
import { HalfResource } from '@/firevase/resources'
import { useAutosaveForm } from '@/utils/hooks'

const props = defineProps<{
  modelValue: boolean
  adventure: HalfResource<Vase, 'adventures'>
}>()

const emit = defineEmits(['update:modelValue'])
const { update } = useAdventure()

// Campos de login
const { fields } = useAutosaveForm(
  useAdventureFields({
    initializeWith: props.adventure,
    update: (newValue) => update(props.adventure.id, newValue),
  })
)
</script>

<template>
  <Drawer
    :model-value="modelValue"
    @update:model-value="(value) => emit('update:modelValue', value)"
    draw-direction="bottom"
  >
    <form class="edit-adventure">
      <!-- Titulo da pagina -->
      <Typography variant="subtitle" class="title">Editar aventura</Typography>

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
      />
    </form>
  </Drawer>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.edit-adventure {
  margin-top: -2rem;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  .fields {
    flex-direction: column;
    align-items: inherit;
    gap: 1.5rem;
  }
}
</style>
