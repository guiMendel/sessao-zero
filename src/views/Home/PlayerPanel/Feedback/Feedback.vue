<script setup lang="ts">
import { vase } from '@/api'
import { useCurrentPlayer } from '@/api/players'
import { Button, Drawer, LoadingSpinner, Typography } from '@/components'
import { Fields } from '@/components/Fields'
import { useResource } from '@/firevase/resources'
import { useAlert } from '@/stores'
import { useTrackErrors } from '@/stores/useTrackErrors'
import { fieldRef } from '@/utils/functions'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  type: 'bug' | 'feedback' | undefined
}>()

const emit = defineEmits(['update:modelValue'])

const { player } = useCurrentPlayer()

const { lastErrors } = useTrackErrors()

const feedback = useResource(vase, 'feedback')

const fields = {
  title: fieldRef('assunto', {
    initialValue: '',
    describe: () => 'sobre o quê gostaria de nos informar?',
    validator: (text) => {
      if (text.length === 0) return 'obrigatorio'
      if (text.length > 50) return 'muito longo'

      return true
    },
  }),

  replyAt: fieldRef('contato (opcional)', {
    initialValue: '',
    describe: () =>
      'se aceitar um possível retorno para entendermos melhor sua mensagem, pode fornecer algum meio de contato, como email ou telefone!',
  }),

  description: fieldRef(
    { name: 'mensagem', type: 'multi-line' },
    {
      initialValue: '',
      describe: () => 'nos conte detalhes, o que aconteceu, como, onde, quando',
      validator: (text) => {
        if (text.length === 0) return 'obrigatorio'
        if (text.length > 1000) return 'muito longo'

        return true
      },
    }
  ),

  reproduction: fieldRef(
    { name: 'como reproduzir', type: 'multi-line' },
    {
      initialValue: '',
      describe: () => 'como um engenheiro poderá reproduzir esse bug?',
      validator: (text) => {
        if (text.length === 0) return 'obrigatorio'
        if (text.length > 1000) return 'muito longo'

        return true
      },
    }
  ),
}

const fieldsValid = computed(
  () =>
    fields.title.validate(fields.title.value) === true &&
    fields.description.validate(fields.description.value) === true &&
    (props.type !== 'bug' ||
      fields.reproduction.validate(fields.reproduction.value) === true)
)

const { alert } = useAlert()

const send = async () => {
  if (!fieldsValid.value || !props.type) return

  await feedback.create({
    description: fields.description.value,
    devicePixelRatio: window.devicePixelRatio,
    lastErrors: JSON.stringify(lastErrors.value),
    replyTo: fields.replyAt.value,
    screenHeight: screen.height,
    screenWidth: screen.width,
    stepsToReproduce: fields.reproduction.value,
    subject: fields.title.value,
    type: props.type,
    userAgent: navigator.userAgent,
  })

  fields.description.value = ''
  fields.replyAt.value = ''
  fields.reproduction.value = ''
  fields.title.value = ''

  alert('success', 'recebemos sua mensagem!')

  emit('update:modelValue', false)
}
</script>

<template>
  <Drawer
    :model-value="Boolean(modelValue && type)"
    @update:model-value="(value) => emit('update:modelValue', value)"
    v-if="player"
    class="feedback"
    draw-direction="bottom"
  >
    <Typography class="heading" variant="subtitle">{{
      type === 'bug' ? 'Relatar bug' : 'Feedback'
    }}</Typography>

    <Typography class="subheading"
      >Agradecemos imensamente o retorno!</Typography
    >

    <Fields
      class="fields"
      :fields="[
        fields.title,
        fields.description,
        ...(type === 'bug' ? [fields.reproduction] : []),
        fields.replyAt,
      ]"
      auto-focus="assunto"
    />

    <Typography class="disclaimer" variant="paragraph-secondary"
      >sua mensagem será anônima, e coletaremos informação sobre seu navegador,
      dimensão de tela e erros para facilitar a análise</Typography
    >

    <Button variant="colored" @click="send" :disabled="!fieldsValid"
      ><font-awesome-icon :icon="['fas', 'paper-plane']" />enviar</Button
    >
  </Drawer>

  <LoadingSpinner v-else />
</template>

<style lang="scss">
@import '@/styles/variables.scss';

#app .feedback {
  flex-direction: column;
  align-items: stretch;
  gap: 1.5rem;
  padding-top: 2rem;

  .subheading {
    opacity: 0.8;
    margin-top: -1rem;
  }

  .disclaimer {
    font-weight: 500;
  }

  .fields {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
