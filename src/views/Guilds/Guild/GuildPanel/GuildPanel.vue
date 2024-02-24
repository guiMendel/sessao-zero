<script setup lang="ts">
import { Vase, vase } from '@/api'
import { useCurrentPlayer } from '@/api/players'
import { Button, Divisor, Drawer, Typography } from '@/components'
import { IconButton } from '@/components/IconButton'
import { removeRelation } from '@/firevase/relations'
import { HalfResource } from '@/firevase/resources'
import { useInput } from '@/stores'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  guild: HalfResource<Vase, 'guilds'>
}>()

const { update } = useCurrentPlayer()

const router = useRouter()

const isOpen = ref(false)

const switchGuild = () => {
  update({ preferredGuildId: null })

  router.push({ name: 'home' })
}

const configureGuild = () => {
  router.push({ name: 'guild-configurations' })
  isOpen.value = false
}

const { player } = useCurrentPlayer()

const { getBooleanInput } = useInput()

const leaveGuild = () =>
  getBooleanInput({
    cancelValue: false,
    messageHtml: `Tem certeza de que deseja abandonar a guilda <b>${props.guild.name}</b>?`,
    trueButton: { buttonProps: { variant: 'colored' }, label: 'abandonar' },
    falseButton: { label: 'cancelar' },
  })
    .then(async (confirm) => {
      if (!confirm || !player.value) return

      await removeRelation(vase, player.value, 'guilds', [props.guild])

      router.push({ name: 'home' })
    })
    .catch(() => {})

const goToMembers = () => {
  isOpen.value = false
  router.push({ name: 'guild-members' })
}

const gotToAdventures = () => {
  isOpen.value = false
  router.push({ name: 'adventures' })
}
</script>

<template>
  <div class="guild-panel-toggle" @click="isOpen = true">
    <IconButton color="main-light" icon="bars" />
  </div>

  <Drawer
    v-if="guild != null && player != null"
    v-model="isOpen"
    class="guild-panel"
    prefered-side="left"
  >
    <div class="heading">
      <Typography>painel da guilda</Typography>
      <Typography variant="title">{{ guild.name }}</Typography>
    </div>

    <Divisor />

    <div class="menu">
      <!-- Configurar -->
      <Button
        v-if="player.id === guild.ownerUid"
        variant="colored"
        @click="configureGuild"
        ><font-awesome-icon :icon="['fas', 'hammer']" /> gerenciar</Button
      >

      <!-- Trocar -->
      <Button variant="colored" @click="gotToAdventures"
        ><font-awesome-icon :icon="['fas', 'scroll']" /> aventuras</Button
      >

      <!-- Ver membros -->
      <Button variant="colored" @click="goToMembers"
        ><font-awesome-icon :icon="['fas', 'users']" /> membros</Button
      >

      <!-- Trocar -->
      <Button @click="switchGuild"
        ><font-awesome-icon :icon="['fas', 'repeat']" /> trocar de
        guilda</Button
      >

      <!-- Deixar guilda -->
      <Button @click="leaveGuild" v-if="guild.ownerUid !== player.id"
        ><font-awesome-icon :icon="['fas', 'person-running']" /> deixar
        guilda</Button
      >
    </div>
  </Drawer>
</template>

<style lang="scss" scoped>
.guild-panel-toggle {
  position: absolute;
  top: 1rem;
  left: 1.5rem;

  z-index: 30;

  font-size: 2.2rem;
}

.guild-panel {
  .heading {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    text-align: center;

    color: var(--tx-main-dark);
  }

  .divisor {
    color: var(--tx-main);
  }

  .menu {
    align-items: stretch;
    flex-direction: column;
    width: 80%;
    align-self: center;
    gap: 1rem;

    > * {
      align-items: center;
      gap: 0.3rem;
    }
  }
}
</style>
