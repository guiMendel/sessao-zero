<script setup lang="ts">
import { Vase, vase } from '@/api'
import { isNarrator } from '@/api/adventures'
import { useNotification } from '@/api/notifications'
import {
  Button,
  Divisor,
  Drawer,
  NotificationsBadge,
  PlayerPreview,
  Typography,
} from '@/components'
import { addRelation, removeRelation } from '@/firevase/relations'
import { HalfResource, Resource } from '@/firevase/resources'
import { computed, ref, toValue } from 'vue'

const props = defineProps<{
  player: Resource<Vase, 'players'>
  adventure: Resource<Vase, 'adventures'>
}>()

const emit = defineEmits(['cancel-request'])

const { notifyPlayer } = useNotification()

const playerHasRequestedAdmission = computed(() =>
  toValue(props.player.adventureAdmissionRequests)?.some(
    (requestedAdventure) => requestedAdventure.id === props.adventure.id
  )
)

const hasAdmissionRequests = computed(
  () => toValue(props.adventure.admissionRequests).length > 0
)

const showSeeRequestsButton = computed(
  () =>
    isNarrator(props.player.id, props.adventure) &&
    (props.adventure.requireAdmission || hasAdmissionRequests.value)
)

const showAdmissionRequests = ref(false)

const rejectPlayer = async (targetPlayer: HalfResource<Vase, 'players'>) =>
  removeRelation(vase, props.adventure, 'admissionRequests', [targetPlayer])

const acceptPlayer = async (targetPlayer: HalfResource<Vase, 'players'>) => {
  notifyPlayer(targetPlayer.id, {
    type: 'adventureAdmissionRequestAccepted',
    params: { adventure: props.adventure },
  })

  return Promise.all([
    removeRelation(vase, props.adventure, 'admissionRequests', [targetPlayer]),
    addRelation(vase, props.adventure, 'players', [targetPlayer]),
  ])
}
</script>

<template>
  <!-- Botao para ver solicitacoes -->
  <Button
    class="view-requests"
    variant="colored"
    @click="showAdmissionRequests = true"
    v-if="showSeeRequestsButton"
    :disabled="toValue(adventure.admissionRequests).length === 0"
  >
    <NotificationsBadge :count="toValue(adventure.admissionRequests).length" />

    <font-awesome-icon :icon="['fas', 'envelope']" />
    ver solicitações
  </Button>

  <Divisor class="divisor" v-if="showSeeRequestsButton" />

  <!-- Aba com as solicitacoes -->
  <Drawer
    v-if="hasAdmissionRequests"
    v-model="showAdmissionRequests"
    draw-direction="bottom"
    class="admission-requests"
  >
    <Typography variant="subtitle" class="heading"
      >Admitir jogadores</Typography
    >

    <PlayerPreview
      v-for="requestedPlayer in toValue(adventure.admissionRequests)"
      :key="requestedPlayer.id"
      :player="requestedPlayer"
      background="main"
    >
      <div @click.stop class="actions">
        <font-awesome-icon
          class="admit"
          @click="acceptPlayer(requestedPlayer)"
          :icon="['fas', 'circle-check']"
        />

        <font-awesome-icon
          class="reject"
          @click="rejectPlayer(requestedPlayer)"
          :icon="['fas', 'circle-xmark']"
        />
      </div>
    </PlayerPreview>
  </Drawer>

  <!-- Mensagem de solicitaçao enviada -->
  <div v-if="playerHasRequestedAdmission" class="admission-request-sent">
    <div class="row">
      <font-awesome-icon class="hourglass" :icon="['fas', 'hourglass-half']" />
      <Typography>entrada solicitada!</Typography>
    </div>

    <Button @click="emit('cancel-request')" class="cancel">cancelar</Button>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.divisor {
  color: var(--tx-main-light);
  margin-block: 0.8rem;
}

.admission-request-sent {
  background-color: var(--bg-main-lighter);
  padding: 0.5rem 0.8rem;
  border-radius: $border-radius;
  align-items: stretch;
  flex-direction: column;
  grid-auto-flow: 0.8rem;
  gap: 0.4rem;

  .row {
    align-items: center;
    justify-content: center;
    gap: 0.6rem;

    .hourglass {
      font-size: 1.1em;
    }
  }

  .cancel {
    margin-bottom: 0.2rem;
  }
}

.admission-requests {
  .heading {
    margin-top: -1rem;
  }

  .actions {
    margin-inline: auto 0.5rem;
    gap: 1rem;
    font-size: 1.8rem;

    .admit {
      color: var(--main);
    }
  }
}
</style>
