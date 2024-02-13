<script setup lang="ts">
import { Vase, vase } from '@/api'
import { generateLink, useCurrentGuild } from '@/api/guilds'
import { useCurrentPlayer } from '@/api/players'
import {
  Button,
  Divisor,
  DropdownIcon,
  LoadingSpinner,
  NotificationsBadge,
  PlayerPreview,
  Typography,
} from '@/components'
import { removeRelation } from '@/firevase/relations'
import { HalfResource } from '@/firevase/resources'
import { useAlert, useInput } from '@/stores'
import { computed, ref, toValue } from 'vue'
import { AdmissionRequests } from './AdmissionRequests'

const { guild } = useCurrentGuild()
const { player } = useCurrentPlayer()

const { getBooleanInput } = useInput()
const { alert } = useAlert()

const isOwner = computed(
  () => guild.value && guild.value?.ownerUid === player.value?.id
)

const kickPlayer = (player: HalfResource<Vase, 'players'>) =>
  getBooleanInput({
    cancelValue: false,
    messageHtml: `Deseja expulsar o jogador <b>${player.nickname}</b>?`,
    trueButton: { buttonProps: { variant: 'colored' } },
  }).then(async (decision) => {
    if (!decision || !guild.value) return

    await removeRelation(vase, guild.value, 'players', [player])

    alert('success', `${player.nickname} não é mais membro da guilda`)
  })

const manualLinkOutput = ref('')

const getInviteLink = () => {
  if (!guild.value) return

  const link = generateLink(guild.value.id, { fullPath: true })

  navigator.clipboard
    .writeText(link)
    .then(() => alert('success', 'Link copiado!'))
    .catch(() => {
      manualLinkOutput.value = link

      alert('error', 'Falha em copiar link. Copie manualmente, por favor')
    })
}

/** Se mostra ou nao a aba de solicitacoes de entrada */
const showAdmissionRequests = ref(false)
</script>

<template>
  <LoadingSpinner v-if="!guild" />

  <div class="guild-members" v-else>
    <Typography variant="subtitle">Membros</Typography>

    <Typography class="sub-heading">{{ guild.name }}</Typography>

    <div v-if="player && player.id === guild.ownerUid" class="master-actions">
      <Button class="button" variant="colored" @click="getInviteLink">
        <font-awesome-icon :icon="['fas', 'link']" />
        convidar
      </Button>

      <Button
        v-if="guild.requireAdmission || toValue(guild.admissionRequests).length"
        class="button"
        variant="colored"
        @click="showAdmissionRequests = true"
      >
        <NotificationsBadge :count="toValue(guild.admissionRequests).length" />

        <font-awesome-icon :icon="['fas', 'key']" />
        admitir
      </Button>
    </div>

    <div class="manual-link-output" v-if="manualLinkOutput">
      <Typography variant="paragraph-secondary" class="heading"
        >link de convite:</Typography
      >

      <Typography class="link">{{ manualLinkOutput }}</Typography>
    </div>

    <div class="members">
      <!-- Perfil do mestre -->
      <PlayerPreview
        :player="toValue(guild.owner)"
        background="main"
        profile-icon="crown"
      />

      <Typography class="label" variant="paragraph-secondary"
        >mestre desta guilda</Typography
      >

      <!-- Demais perfis -->
      <template v-if="toValue(guild.players).length > 0">
        <Divisor class="divisor" />

        <PlayerPreview
          v-for="member in toValue(guild.players)"
          :key="member.id"
          :player="member"
          background="main"
        >
          <DropdownIcon @click.stop class="actions" v-if="isOwner">
            <div class="option" @click="kickPlayer(member)">
              <font-awesome-icon :icon="['fas', 'user-large-slash']" />
              expulsar
            </div>
          </DropdownIcon>
        </PlayerPreview>
      </template>
    </div>
  </div>

  <AdmissionRequests v-model="showAdmissionRequests" :guild="guild" />
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

  .manual-link-output {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;

    .link {
      background-color: var(--bg-main-lighter);
      word-break: break-all;
      padding: 1rem;
      border-radius: $border-radius;
    }
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
.guild-members .master-actions {
  align-items: center;
  gap: 0.5rem;

  .button {
    flex: 1;
    min-width: unset;
  }
}
</style>
