<script setup lang="ts">
import { Button, Divisor, Drawer, Typography } from '@/components'
import { IconButton } from '@/components/IconButton'
import { Guild, Resource } from '@/types'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{
  guild: Resource<Guild>
}>()

const router = useRouter()

const isOpen = ref(false)

const switchGuild = () => router.push({ name: 'home' })
</script>

<template>
  <div class="guild-panel-toggle" @click="isOpen = true">
    <IconButton color="main-light" icon="bars" />
  </div>

  <Drawer v-if="guild != null" v-model="isOpen" class="guild-panel">
    <div class="heading">
      <Typography>painel da guilda</Typography>
      <Typography variant="title">{{ guild.name }}</Typography>
    </div>

    <Divisor />

    <div class="menu">
      <!-- Trocar -->
      <Button variant="colored" @click="switchGuild"
        ><font-awesome-icon :icon="['fas', 'repeat']" /> trocar de
        guilda</Button
      >

      <!-- Ver membros -->
      <Button variant="colored"
        ><font-awesome-icon :icon="['fas', 'users']" /> membros</Button
      >

      <!-- Deixar guilda -->
      <Button
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
