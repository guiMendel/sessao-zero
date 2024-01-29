<script setup lang="ts">
import { Vase, vase } from '@/api'
import { useCurrentGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import {
  Divisor,
  DropdownIcon,
  LoadingSpinner,
  PlayerPreview,
  Typography,
} from '@/components'
import { removeRelation } from '@/firevase/relations'
import { HalfResource } from '@/firevase/resources'
import { useAlert, useInput } from '@/stores'
import { computed, toValue } from 'vue'

const { guild } = useCurrentGuild()
const { player } = useCurrentPlayer()

const { getBooleanInput } = useInput()
const { alert } = useAlert()

const isOwner = computed(
  () => guild.value && guild.value?.ownerUid === player.value?.id
)

const kickPlayer = (player: HalfResource<Vase, 'players'>) =>
  getBooleanInput({
    cancellable: true,
    messageHtml: `Deseja expulsar o jogador <b>${player.name}</b>?`,
    trueButton: { buttonProps: { variant: 'colored' } },
  })
    .then(async (decision) => {
      if (!decision || !guild.value) return

      await removeRelation(vase, guild.value, 'players', [player])

      alert('success', `${player.name} não é mais membro da guilda`)
    })
    .catch(() => {})
</script>

<template>
  <LoadingSpinner v-if="!guild" />

  <div class="guild-members" v-else>
    <Typography variant="subtitle">Membros</Typography>

    <Typography class="sub-heading">{{ guild.name }}</Typography>

    <div class="members">
      <!-- Perfil do mestre -->
      <PlayerPreview
        :player="toValue(guild.owner)"
        background="main"
        profile-icon="crown"
        :show-profile-button="false"
      />

      <Typography class="label" variant="paragraph-secondary"
        >mestre desta guilda</Typography
      >

      <!-- Demais perfis -->
      <template v-if="toValue(guild.players).length > 0">
        <Divisor class="divisor" />

        <div
          class="player-wrapper"
          v-for="member in toValue(guild.players)"
          :key="member.id"
        >
          <PlayerPreview
            :player="member"
            background="main"
            :show-profile-button="false"
          />

          <div class="actions">
            <DropdownIcon v-if="isOwner">
              <div class="option" @click="kickPlayer(member)">
                <font-awesome-icon :icon="['fas', 'user-large-slash']" />
                expulsar
              </div>
            </DropdownIcon>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.guild-members {
  margin-top: 1rem;
  flex-direction: column;
  gap: 1rem;

  width: 100%;
  text-align: left;

  .sub-heading {
    margin-top: -0.8rem;
    color: var(--tx-trans-45);
  }

  .members {
    margin-top: 1rem;
    gap: 1.5rem;
    flex-direction: column;
    align-items: stretch;

    .label {
      margin-top: -1rem;
      font-weight: 500;
      color: var(--tx-trans-3);
      text-align: center;
      align-self: center;
    }

    .divisor {
      color: var(--main-light);
    }

    .player-wrapper {
      position: relative;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;

      .actions {
        position: absolute;
        right: 1.5rem;

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
}
</style>
