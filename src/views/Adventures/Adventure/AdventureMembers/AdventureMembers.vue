<script setup lang="ts">
import { Vase, vase } from '@/api'
import { isNarrator } from '@/api/adventures'
import { useCurrentAdventure } from '@/api/adventures/useCurrentAdventure'
import { isMember } from '@/api/isMember'
import { NotificationParams, useNotification } from '@/api/notifications'
import { useCurrentPlayer } from '@/api/players'
import emptyRoomPicture from '@/assets/empty-room.png'
import stopKnightPicture from '@/assets/stop-knight.png'
import tooManyWizardsPicture from '@/assets/too-many-wizards.png'
import { Button, DropdownIcon, PlayerPreview, Typography } from '@/components'
import { removeRelation } from '@/firevase/relations'
import { HalfResource } from '@/firevase/resources'
import { useAlert, useInput } from '@/stores'
import { computed, toValue } from 'vue'
import { AdmissionRequests } from '../AdmissionRequests'

const { player } = useCurrentPlayer()

const { getBooleanInput } = useInput()
const { adventure } = useCurrentAdventure()
const { notifyPlayer } = useNotification()

defineProps<{
  showEmptyRoomPrompt: boolean
  showEnter: boolean
  guildDisallowsSubscription: boolean
  joinLabel: string
}>()

const emit = defineEmits(['toggle-enter-request'])

const spots = computed(() =>
  adventure.value && adventure.value.playerLimit > 0
    ? [
        ...Array(
          adventure.value.playerLimit - toValue(adventure.value.players).length
        ).keys(),
      ]
    : []
)

const leave = async () => {
  if (!adventure.value || !player.value) return

  const leave = await getBooleanInput({
    messageHtml: `Deseja mesmo deixar a aventura <b>${adventure.value.name}</b>?`,
    trueButton: { buttonProps: { variant: 'colored' }, label: 'deixar' },
    falseButton: { label: 'ficar' },
  })

  if (!leave) return

  const notification: NotificationParams<'playerLeftAdventure'> = {
    type: 'playerLeftAdventure',
    params: { adventure: adventure.value, player: player.value },
  }

  for (const narrator of toValue(adventure.value.narrators))
    notifyPlayer(narrator.id, notification)

  return removeRelation(vase, adventure.value, 'players', [player.value])
}

const { alert } = useAlert()

const kickPlayer = async (targetPlayer: HalfResource<Vase, 'players'>) => {
  if (
    !player.value ||
    !adventure.value ||
    !isNarrator(player.value.id, adventure.value)
  )
    return

  const kick = await getBooleanInput({
    cancelValue: false,
    messageHtml: `Deseja expulsar o jogador <b>${targetPlayer.nickname}</b>?`,
    trueButton: { buttonProps: { variant: 'colored' } },
  })

  if (!kick || !adventure.value) return

  await removeRelation(vase, adventure.value, 'players', [targetPlayer])

  alert('success', `${targetPlayer.nickname} não é mais membro da adventura`)
}
</script>

<template>
  <div class="players" v-if="player && adventure">
    <AdmissionRequests
      :player="player"
      :adventure="adventure"
      @cancel-request="emit('toggle-enter-request')"
    />

    <!-- Mensagem de "sem jogadores" -->
    <template v-if="showEmptyRoomPrompt">
      <img :src="emptyRoomPicture" alt="sala vazia" />

      <Typography>parece meio vazio aqui... por enquanto!</Typography>

      <Button
        v-if="showEnter"
        variant="colored"
        class="empty-room-enter-prompt"
        @click="emit('toggle-enter-request')"
        ><font-awesome-icon :icon="['fas', 'dungeon']" />{{ joinLabel }}</Button
      >
    </template>

    <template v-else>
      <!-- Jogadores atuais -->
      <PlayerPreview
        v-for="iterationPlayer in toValue(adventure.players)"
        :player="iterationPlayer"
        background="main"
        show-undefined-as-empty
        :key="iterationPlayer.id"
      >
        <div
          class="leave-adventure"
          v-if="iterationPlayer?.id === player?.id"
          @click.stop="leave"
        >
          <font-awesome-icon :icon="['fas', 'person-running']" />sair
        </div>

        <DropdownIcon
          @click.stop
          class="actions"
          v-if="player && isNarrator(player.id, adventure)"
        >
          <div class="option" @click="kickPlayer(iterationPlayer)">
            <font-awesome-icon :icon="['fas', 'user-large-slash']" />
            expulsar
          </div>
        </DropdownIcon>
      </PlayerPreview>

      <!-- Vagas disponiveis -->
      <template
        v-if="
          player &&
          adventure.playerLimit > 0 &&
          adventure.open &&
          !guildDisallowsSubscription
        "
      >
        <PlayerPreview
          v-for="spotIndex in spots"
          :player="undefined"
          show-undefined-as-empty
          :key="spotIndex"
          background="main"
        />

        <!-- Nao ha mais vagas -->
        <template
          v-if="
            !isMember(player, adventure) &&
            toValue(adventure.players).length >= adventure.playerLimit
          "
        >
          <img
            :src="tooManyWizardsPicture"
            alt="leao de chacara emburrado"
            class="too-many-wizards"
          />

          <Typography
            >me desculpe, está bem lotado aqui... não caberia mais
            ninguém!</Typography
          >
        </template>
      </template>
    </template>

    <!-- Aventura fechada -->
    <template v-if="!adventure.open || guildDisallowsSubscription">
      <img
        :src="stopKnightPicture"
        alt="leao de chacara emburrado"
        class="stop-knight"
      />

      <Typography
        >parado ai aventureiro!

        <template v-if="guildDisallowsSubscription">
          Esta guilda não está aceitando inscrições nas aventuras ainda
        </template>

        <template v-else> Esta aventura está de portas fechadas </template>
      </Typography>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.players {
  padding-top: 1rem;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  .too-many-wizards {
    margin-inline: -1.5rem;
  }

  .stop-knight {
    width: 60%;
    align-self: center;
  }

  .leave-adventure {
    align-items: center;
    background-color: var(--bg-trans-1);
    color: var(--tx-trans-3);
    gap: 0.2rem;
    margin-left: auto;
    border-radius: $border-radius;
    padding: 0.2rem 0.6rem;
  }

  .actions {
    margin-inline: auto 0.5rem;

    .option {
      padding: 0.5rem;
      gap: 0.3rem;
      align-items: center;

      svg {
        font-size: 0.9rem;
      }
    }
  }
}
</style>

<style lang="scss">
#app .players .admission-request-sent .cancel button {
  min-width: unset;
  min-height: unset;
  align-self: center;
  padding: 0.4rem 0.9rem;

  background-color: var(--bg-trans-1);
  font-size: 0.9rem;
}
</style>
