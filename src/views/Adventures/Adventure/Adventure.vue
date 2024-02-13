<script setup lang="ts">
import { vase } from '@/api'
import { useCurrentAdventure } from '@/api/adventures/useCurrentAdventure'
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { NotificationParams, useNotification } from '@/api/notifications'
import { useCurrentPlayer } from '@/api/players'
import emptyRoomPicture from '@/assets/empty-room.png'
import genericBanner from '@/assets/rpg-table.png'
import stopKnightPicture from '@/assets/stop-knight.png'
import tooManyWizardsPicture from '@/assets/too-many-wizards.png'
import {
  Button,
  Divisor,
  LoadingSpinner,
  PlayerPreview,
  Typography,
} from '@/components'
import { Tabs } from '@/components/Tabs'
import { addRelation, removeRelation } from '@/firevase/relations'
import { useInput } from '@/stores'
import { sessionStorageKeys } from '@/utils/config'
import { useSessionStorage } from '@vueuse/core'
import { computed, toValue } from 'vue'
import { useRoute } from 'vue-router'

const { adventure } = useCurrentAdventure()
const { player } = useCurrentPlayer()
const { guild } = useCurrentGuild()

type Tab = 'detalhes' | 'jogadores'
const allTabs: Tab[] = ['detalhes', 'jogadores']

const route = useRoute()

const tab = useSessionStorage<Tab>(
  `${sessionStorageKeys.adventurePageTab}-${route.params.adventureId}`,
  'detalhes'
)

const spots = computed(() =>
  adventure.value && adventure.value.playerLimit > 0
    ? [
        ...Array(
          adventure.value.playerLimit - toValue(adventure.value.players).length
        ).keys(),
      ]
    : []
)

const showEnter = computed(
  () =>
    player.value &&
    adventure.value?.open &&
    isMember(player.value, guild.value) &&
    !isMember(player.value, adventure.value) &&
    (adventure.value.playerLimit < 0 ||
      adventure.value.playerLimit > toValue(adventure.value.players).length)
)

/** Se esta mostrando a tela de "parece vazio aqui..." com um prompt para entrar */
const showEmptyRoomPrompt = computed(
  () =>
    tab.value === 'jogadores' &&
    adventure.value?.open &&
    toValue(adventure.value.players)?.length === 0
)

const { getBooleanInput } = useInput()
const { notifyPlayer } = useNotification()

const enter = async () => {
  if (!adventure.value || !player.value) return

  const enter = await getBooleanInput({
    messageHtml: `Quer mesmo entrar na aventura <b>${adventure.value.name}</b>?`,
    trueButton: { buttonProps: { variant: 'colored' } },
  })

  if (!enter) return

  const notification: NotificationParams<'playerJoinedAdventure'> = {
    type: 'playerJoinedAdventure',
    params: { adventure: adventure.value, player: player.value },
  }

  for (const narrator of toValue(adventure.value.narrators))
    notifyPlayer(narrator.id, notification)

  return addRelation(vase, adventure.value, 'players', [player.value])
}

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
</script>

<template>
  <LoadingSpinner v-if="!adventure" />

  <div
    v-else
    class="adventure"
    :class="{ 'extra-bottom-padding': showEnter && !showEmptyRoomPrompt }"
  >
    <img :src="genericBanner" alt="capa da aventura" />

    <div class="content">
      <Typography class="subheader">aventura</Typography>

      <Typography variant="title" class="title">{{
        adventure.name
      }}</Typography>

      <!-- Entrar na guilda -->
      <Button
        v-if="showEnter && !showEmptyRoomPrompt"
        variant="colored"
        class="enter-guild-button"
        @click="enter"
        ><font-awesome-icon :icon="['fas', 'dungeon']" />entrar</Button
      >

      <Tabs :tabs="allTabs" v-model="tab">
        <template #jogadores:option>
          <div class="tab" :class="{ active: tab === 'jogadores' }">
            <Typography>jogadores</Typography>

            <div class="count">
              <Typography class="text">{{
                toValue(adventure.players).length
              }}</Typography>
              <Typography v-if="adventure.playerLimit > 0" class="text limit"
                >/{{ adventure.playerLimit }}</Typography
              >
            </div>
          </div>
        </template>

        <template #detalhes>
          <div class="details">
            <Typography class="description">{{
              adventure.description
            }}</Typography>

            <Divisor class="divisor" />

            <Typography variant="paragraph-secondary" class="narrators-label"
              >narrado por</Typography
            >

            <Typography class="narrators">{{
              toValue(adventure.narrators)
                .map((narrator) => narrator.nickname)
                .join(', ')
            }}</Typography>
          </div>
        </template>

        <template #jogadores>
          <div class="players">
            <!-- Mensagem de "sem jogadores" -->
            <template v-if="showEmptyRoomPrompt">
              <img :src="emptyRoomPicture" alt="sala vazia" />

              <Typography>parece meio vazio aqui... por enquanto!</Typography>

              <Button
                v-if="showEnter"
                variant="colored"
                class="empty-room-enter-prompt"
                @click="enter"
                ><font-awesome-icon :icon="['fas', 'dungeon']" />entrar</Button
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
              </PlayerPreview>

              <!-- Vagas disponiveis -->
              <template
                v-if="
                  player &&
                  adventure.playerLimit > 0 &&
                  adventure.open &&
                  !isMember(player, adventure)
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
                    toValue(adventure.players).length >= adventure.playerLimit
                  "
                >
                  <img
                    :src="tooManyWizardsPicture"
                    alt="leao de chacara emburrado"
                    class="uncomfortable-wizards"
                  />

                  <Typography
                    >me desculpe, está bem lotado aqui... não caberia mais
                    ninguém!</Typography
                  >
                </template>
              </template>
            </template>

            <!-- Aventura fechada -->
            <template v-if="!adventure.open">
              <img
                :src="stopKnightPicture"
                alt="leao de chacara emburrado"
                class="stop-knight"
              />

              <Typography
                >parado ai aventureiro! Esta aventura está de portas
                fechadas</Typography
              >
            </template>
          </div>
        </template>
      </Tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.adventure {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  &.extra-bottom-padding {
    padding-bottom: 4rem;
  }

  .content {
    padding-inline: 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }

  .title {
    color: var(--tx-main);
    margin-bottom: 1rem;
    text-align: left;
  }

  .subheader {
    color: var(--tx-trans-3);
    font-weight: 500;
    margin-block: -0.2rem;
  }

  .tab {
    color: var(--tx-trans-45);
    transition: all 200ms;
    align-items: center;
    gap: 0.3rem;

    .count {
      height: 1.2rem;
      background-color: var(--bg-trans-2);
      color: var(--tx-trans-3);
      align-items: center;
      justify-content: center;
      font-weight: 800;
      border-radius: 12px;
      transition: 200ms all;
      padding-inline: 0.4rem;

      .text {
        font-size: 0.8rem;

        &.limit {
          font-size: 0.6rem;
        }
      }
    }

    &.active {
      color: var(--tx-main);

      .count {
        background-color: var(--main-light);
        color: var(--tx-main-dark);
      }
    }
  }

  .details {
    padding-top: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: left;
    white-space: pre-wrap;

    .divisor {
      color: var(--tx-main-light);
      margin-block: 0.8rem;
    }

    .narrators-label {
      color: var(--tx-main-light);
      font-weight: 500;
      margin-bottom: -0.7rem;
    }

    .narrators {
      font-weight: 700;
    }
  }

  .stop-knight {
    width: 70%;
    align-self: center;
  }

  .players {
    padding-top: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;

    .leave-adventure {
      align-items: center;
      background-color: var(--bg-trans-1);
      color: var(--tx-trans-3);
      gap: 0.2rem;
      margin-left: auto;
      border-radius: $border-radius;
      padding: 0.2rem 0.6rem;
    }
  }
}
</style>

<style lang="scss">
.adventure .content .enter-guild-button {
  position: fixed;
  right: 0.6rem;
  bottom: 1rem;
  z-index: 100;

  button {
    min-width: unset;
  }
}
</style>
