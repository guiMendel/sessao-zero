<script lang="ts" setup>
import { useCurrentPlayer } from '@/api'
import {
  Button,
  Divisor,
  Drawer,
  PlayerPreview,
  ProfilePicture,
  Typography,
} from '@/components'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const playerStore = useCurrentPlayer()
const { player } = storeToRefs(playerStore)
const router = useRouter()

const isOpen = ref(false)

const goToConfigurations = () => {
  router.push({ name: 'configurations' })
  isOpen.value = false
}
</script>

<template>
  <template v-if="player == undefined" />

  <template v-else>
    <div class="player-panel-toggle">
      <ProfilePicture class="picture" :player="player" @click="isOpen = true" />
    </div>

    <Drawer v-model="isOpen" class="player-panel">
      <PlayerPreview :player="player" @click="isOpen = false" />

      <Divisor class="divisor" />

      <div class="menu">
        <!-- Configuracoes -->
        <Button variant="colored" @click="goToConfigurations" class="option">
          <font-awesome-icon :icon="['fas', 'screwdriver-wrench']" />
          <Typography>configurações</Typography>
        </Button>

        <!-- Logout -->
        <Button variant="colored" @click="playerStore.logout" class="option">
          <font-awesome-icon :icon="['fas', 'door-open']" />
          <Typography>sair</Typography>
        </Button>
      </div>
    </Drawer>
  </template>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.player-panel-toggle {
  align-self: flex-end;

  margin: 0.5rem 1rem 0;

  .picture {
    @include bevel(var(--tx-main-light));
  }
}

.player-panel {
  .divisor {
    color: var(--tx-main-light);
  }

  .menu {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    min-width: max-content;
    width: 80%;
    align-self: center;

    .option {
      align-items: center;
      gap: 0.3rem;
    }
  }
}
</style>
