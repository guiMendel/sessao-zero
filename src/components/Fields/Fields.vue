<script setup lang="ts" generic="F extends FieldRef<any>">
import { FieldRef } from '@/utils/functions'
import { FileField, InputField, SelectField, ToggleField } from '..'

defineProps<{
  fields: (F | undefined | null | false)[]
  autoFocus?: F['name']
}>()
</script>

<template>
  <div class="fields">
    <template v-for="field in fields">
      <template v-if="!field"></template>

      <!-- Campos de arquivo -->
      <FileField
        v-else-if="field.type === 'file'"
        :model-value="field.value"
        @update:model-value="(newFile) => (field.value = newFile)"
        type="image"
        :label="field.name"
      />

      <!-- Campos de texto single e multi line -->
      <InputField
        v-else-if="field.type === 'single-line' || field.type === 'multi-line'"
        :auto-focus="field.name === autoFocus"
        :field="(field as FieldRef<string>)"
        :multiline="field.type === 'multi-line'"
        :message="field.describe()"
      />

      <!-- Campos de toggle -->
      <ToggleField
        v-else-if="field.type === 'toggle'"
        v-model="(field.value as boolean)"
        :message="field.describe()"
        >{{ field.name }}</ToggleField
      >

      <!-- Campos de numero -->
      <InputField
        v-else-if="field.type === 'number'"
        :auto-focus="field.name === autoFocus"
        :field="(field as FieldRef<number>)"
        :min="field.min"
        :max="field.max"
        :message="field.describe()"
      />

      <!-- Campos de select -->
      <SelectField
        v-else-if="field.type === 'select'"
        v-model="field.value"
        :options="field.options"
        :message="field.describe()"
        >{{ field.name }}</SelectField
      >
    </template>
  </div>
</template>
