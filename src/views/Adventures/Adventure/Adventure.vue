<script setup lang="ts">
import { Vase, vase } from '@/api'
import { isNarrator } from '@/api/adventures'
import { useCurrentAdventure } from '@/api/adventures/useCurrentAdventure'
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { NotificationParams, useNotification } from '@/api/notifications'
import { useCurrentPlayer } from '@/api/players'
import emptyRoomPicture from '@/assets/empty-room.png'
import genericBanner from '@/assets/green-table.png'
import stopKnightPicture from '@/assets/stop-knight.png'
import tooManyWizardsPicture from '@/assets/too-many-wizards.png'
import {
  Button,
  Divisor,
  DropdownIcon,
  LoadingSpinner,
  PlayerPreview,
  Typography,
} from '@/components'
import { Tabs } from '@/components/Tabs'
import { removeRelation } from '@/firevase/relations'
import { HalfResource } from '@/firevase/resources'
import { router } from '@/router'
import { useAlert, useInput } from '@/stores'
import { sessionStorageKeys } from '@/utils/config'
import { useSessionStorage } from '@vueuse/core'
import { computed, ref, toValue } from 'vue'
import { useRoute } from 'vue-router'
import { EditAdventure } from './EditAdventure'
import { AdmissionRequests } from './AdmissionRequests'

const { adventure, deleteForever, addPlayer } = useCurrentAdventure()
const { player } = useCurrentPlayer()
const { guild } = useCurrentGuild()

type Tab = 'detalhes' | 'jogadores'
const allTabs: Tab[] = ['detalhes', 'jogadores']

const route = useRoute()

const tab = useSessionStorage<Tab>(
  `${sessionStorageKeys.adventurePageTab}-${route.params.adventureId}`,
  'detalhes'
)

// =================================================================
// JOGADOR
// =================================================================

const spots = computed(() =>
  adventure.value && adventure.value.playerLimit > 0
    ? [
        ...Array(
          adventure.value.playerLimit - toValue(adventure.value.players).length
        ).keys(),
      ]
    : []
)

const playerHasRequestedAdmission = computed(() =>
  toValue(player.value?.adventureAdmissionRequests)?.some(
    (requestedAdventure) =>
      adventure.value && requestedAdventure.id === adventure.value.id
  )
)

const showEnter = computed(
  () =>
    !playerHasRequestedAdmission.value &&
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

const { getBooleanInput, getStringInput } = useInput()
const { notifyPlayer } = useNotification()

const enter = () => player.value && addPlayer(player.value)

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

const joinLabel = adventure.value?.requireAdmission
  ? 'solicitar entrada'
  : 'entrar'

// =================================================================
// NARRADOR
// =================================================================

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

const showEditPanel = ref(false)

const startEdit = () => {
  if (
    !player.value ||
    !adventure.value ||
    !isNarrator(player.value.id, adventure.value)
  )
    return

  showEditPanel.value = true
}

const destroy = async () => {
  if (
    !player.value ||
    !adventure.value ||
    !isNarrator(player.value.id, adventure.value)
  )
    return

  const confirmDestruction = await getStringInput({
    cancelValue: '',
    inputFieldName: 'nome da aventura',
    validator: (value) =>
      adventure.value && value === adventure.value.name
        ? true
        : 'nomes nao batem',
    submitButton: { label: 'destruir' },
    messageClass: 'guild-configurations__delete-confirmation',
    messageHtml: `\
Tem certeza de que deseja destruir a aventura permanentemente?\
<br />\
Digite <code>${adventure.value.name}</code> para confirmar.`,
  })

  if (!confirmDestruction || !adventure.value) return

  await deleteForever()

  router.push({ name: 'home' })
}
</script>

<template>
  <LoadingSpinner class="loading" v-if="!adventure || !player" />

  <div
    v-else
    class="adventure"
    :class="{ 'extra-bottom-padding': showEnter && !showEmptyRoomPrompt }"
  >
    <img
      :src="toValue(adventure.banner) ?? genericBanner"
      alt="capa da aventura"
    />

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
        ><font-awesome-icon :icon="['fas', 'dungeon']" />{{ joinLabel }}</Button
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
            <!-- Descricao -->
            <Typography class="description">{{
              adventure.description
            }}</Typography>

            <Divisor class="divisor" />

            <!-- Narradores -->
            <Typography variant="paragraph-secondary" class="narrators-label"
              >narrado por</Typography
            >

            <Typography class="narrators">{{
              toValue(adventure.narrators)
                .map((narrator) => narrator.nickname)
                .join(', ')
            }}</Typography>

            <!-- Acoes de narrador -->
            <div class="narrator-actions">
              <!-- Editar -->
              <Button
                variant="colored"
                class="edit-button"
                v-if="isNarrator(player.id, adventure)"
                @click="startEdit"
              >
                <font-awesome-icon
                  :icon="['fas', 'feather-pointed']"
                />editar</Button
              >

              <!-- Deletar -->
              <Button
                class="delete-button"
                v-if="isNarrator(player.id, adventure)"
                @click="destroy"
              >
                <font-awesome-icon :icon="['fas', 'fire']" />excluir</Button
              >
            </div>
          </div>
        </template>

        <template #jogadores>
          <div class="players">
            <AdmissionRequests
              :player="player"
              :adventure="adventure"
              @cancel-request="enter"
            />

            <!-- Mensagem de "sem jogadores" -->
            <template v-if="showEmptyRoomPrompt">
              <img :src="emptyRoomPicture" alt="sala vazia" />

              <Typography>parece meio vazio aqui... por enquanto!</Typography>

              <Button
                v-if="showEnter"
                variant="colored"
                class="empty-room-enter-prompt"
                @click="enter"
                ><font-awesome-icon :icon="['fas', 'dungeon']" />{{
                  joinLabel
                }}</Button
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
                v-if="player && adventure.playerLimit > 0 && adventure.open"
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

  <EditAdventure
    v-if="adventure"
    :key="adventure.id"
    :adventure="adventure"
    v-model="showEditPanel"
  />
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.loading {
  align-self: center;
}

.adventure {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  &.extra-bottom-padding {
    padding-bottom: 4rem;
  }

  .divisor {
    color: var(--tx-main-light);
    margin-block: 0.8rem;
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

    .narrators-label {
      color: var(--tx-main-light);
      font-weight: 500;
      margin-bottom: -0.7rem;
    }

    .narrators {
      font-weight: 700;
    }

    .narrator-actions {
      margin-top: 0.5rem;
      flex-direction: column;
      align-items: stretch;
      gap: 1.5rem;
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

<style lang="scss">
.adventure .players .admission-request-sent .cancel button {
  min-width: unset;
  min-height: unset;
  align-self: center;
  padding: 0.4rem 0.9rem;

  background-color: var(--bg-trans-1);
  font-size: 0.9rem;
}
</style>
