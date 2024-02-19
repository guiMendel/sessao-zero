<script setup lang="ts">
import { useCurrentPlayer, usePlayer } from '@/api/players'
import {
  Button,
  LoadingSpinner,
  ProfilePicture,
  Typography,
} from '@/components'
import { computed, ref, toValue, watch } from 'vue'
import { useRoute } from 'vue-router'
import { EditPlayer } from './EditPlayer'
import { useInput } from '@/stores'
import { useRouter } from 'vue-router'

const { sync } = usePlayer()
const route = useRoute()

const player = sync(route?.params.playerId as string)

watch(route, ({ params }) => {
  if (params.playerId != undefined)
    sync(params.playerId as string, { existingRef: player })
})

const showEditPanel = ref(false)

const startEdit = () => {
  if (player.value) showEditPanel.value = true
}

const { player: loggedPlayer, deleteForever } = useCurrentPlayer()

const isCurrentPlayer = computed(
  () => loggedPlayer.value && loggedPlayer.value.id === player.value?.id
)

const { getStringInput } = useInput()

const router = useRouter()

const destroyPlayer = async () => {
  if (!player.value || !isCurrentPlayer.value) return

  const confirmDestruction = await getStringInput({
    cancelValue: '',
    inputFieldName: 'apelido',
    validator: (value) =>
      player.value && value === player.value.nickname
        ? true
        : 'apelido incorreto',
    submitButton: { label: 'apagar' },
    messageClass: 'guild-configurations__delete-confirmation',
    messageHtml: `\
Tem certeza de que deseja apagar sua conta permanentemente?\
<br />\
Digite <code>${player.value.nickname}</code> para confirmar.`,
  })

  if (!confirmDestruction || !player.value) return

  await deleteForever()

  router.push({ name: 'home' })
}
</script>

<template>
  <LoadingSpinner v-if="!player" />

  <div class="player" v-else>
    <header>
      <!-- O handle do jogador -->
      <Typography class="handle">@{{ player.nickname }}</Typography>

      <!-- Imagem e dados -->
      <div class="row">
        <ProfilePicture
          class="picture"
          :player="player"
          background="main-washed"
        />

        <!-- Dados -->
        <div class="data">
          <div class="item">
            <Typography class="label" variant="paragraph-secondary"
              >jogando</Typography
            >
            <Typography class="content">{{
              toValue(player.playerAdventures).length
            }}</Typography>
          </div>

          <div class="item">
            <Typography class="label" variant="paragraph-secondary"
              >narrando</Typography
            >
            <Typography class="content">{{
              toValue(player.narratorAdventures).length
            }}</Typography>
          </div>
        </div>
      </div>

      <!-- Nome -->
      <Typography variant="subtitle" class="name">{{ player.name }}</Typography>
    </header>

    <!-- Sobre -->
    <div class="about">
      <Typography variant="paragraph-secondary" class="label">sobre</Typography>

      <Typography v-if="player.about" class="content">{{
        player.about
      }}</Typography>

      <Typography v-else class="empty">vazio</Typography>
    </div>

    <div class="self-actions" v-if="isCurrentPlayer">
      <!-- Editar -->
      <Button variant="colored" class="edit-button" @click="startEdit">
        <font-awesome-icon :icon="['fas', 'feather-pointed']" />editar</Button
      >

      <!-- Deletar -->
      <Button class="delete-button" @click="destroyPlayer">
        <font-awesome-icon :icon="['fas', 'fire']" />apagar</Button
      >
    </div>
  </div>

  <EditPlayer
    v-if="player && isCurrentPlayer"
    :key="player.id"
    :player="player"
    v-model="showEditPanel"
  />
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.player {
  width: 100%;
  min-height: 100vh;
  align-items: stretch;
  gap: 2rem;
  flex-direction: column;
  padding-bottom: 2rem;

  header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1.3rem 1.5rem 1rem;

    background-color: var(--bg-main-lighter);

    .handle {
      align-self: center;
      margin-bottom: 2rem;
      font-weight: 600;
      color: var(--tx-main);
    }

    .row {
      align-items: center;
      gap: 1rem;

      .picture {
        font-size: 2rem;
      }

      .data {
        flex: 1;
        align-items: center;
        justify-content: space-around;
        gap: 1rem;
        flex-wrap: wrap;

        .item {
          flex-direction: column;
          align-items: center;
          text-align: center;

          .label {
            @include field-label;
            font-size: 0.8rem;
            opacity: 0.6;
          }

          .content {
            color: var(--tx-main);
            font-weight: 500;
            font-size: 2rem;
          }
        }
      }
    }

    .name {
      font-size: 2rem;
      align-self: flex-start;
      text-align: left;
    }
  }

  .about {
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
    text-align: left;
    padding-inline: 1.5rem;

    .label {
      @include field-label;
    }

    .empty {
      opacity: 0.9;
      font-weight: 500;
      font-style: italid;
    }
  }

  .self-actions {
    margin-top: auto;
    padding-inline: 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
