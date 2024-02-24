<script lang="ts" setup>
import { useGuild } from '@/api/guilds'
import { isGuildMaster, useCurrentPlayer } from '@/api/players'
import { Typography } from '@/components'
import { hasLoaded } from '@/firevase/resources'
import { useInput } from '@/stores'
import { computed, toValue, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { GuildList } from './GuildList'

const { create } = useGuild()

const { player } = useCurrentPlayer()

const joinedGuilds = computed(() => toValue(player.value?.guilds) ?? [])

const router = useRouter()

const addNewGuild = () => {
  router.push({
    name: 'add-guild',
  })
}

// Se nao tiver nenhuma guilda, vai direto pra pagina de adicionar guildas
watchEffect(() => {
  // Deve ter carregado todos os recursos
  if (
    player.value == undefined ||
    isGuildMaster(player.value) ||
    !hasLoaded([player, 'guilds'])
  )
    return

  // Verifica se faz parte de alguma guilda
  if (joinedGuilds.value.length == 0) addNewGuild()
})

const { getStringInput } = useInput()

const createGuild = () =>
  getStringInput({
    cancelValue: '',
    messageHtml: 'Qual será o nome da guilda?',
    inputFieldName: 'nome',
    validator: (name) => (name.length > 2 ? true : 'Mínimo de 2 caracteres'),
    submitButton: { label: 'criar', buttonProps: { variant: 'colored' } },
  }).then((name) => {
    if (name) create(name)
  })
</script>

<template>
  <div v-if="player" class="guilds-index">
    <!-- Guildas que eh dono -->
    <div class="group" v-if="isGuildMaster(player)">
      <Typography class="heading" variant="subtitle">
        <font-awesome-icon :icon="['fas', 'crown']" />
        Mestre</Typography
      >

      <Typography class="sub-heading" variant="paragraph-secondary"
        >As guildas das quais você é dono</Typography
      >

      <GuildList
        v-if="toValue(player.ownedGuilds).length > 0"
        :guilds="toValue(player.ownedGuilds)"
      />

      <Typography @click="createGuild" class="add-guild">
        criar
        <font-awesome-icon :icon="['fas', 'plus']" />
      </Typography>
    </div>

    <!-- Guildas que ja faz parte -->
    <div class="group">
      <Typography
        variant="subtitle"
        class="heading"
        v-if="isGuildMaster(player)"
        ><font-awesome-icon :icon="['fas', 'user']" /> Membro</Typography
      >

      <Typography variant="subtitle" class="heading" v-else
        >Suas guildas</Typography
      >

      <Typography
        v-if="isGuildMaster(player)"
        class="sub-heading"
        variant="paragraph-secondary"
        >Guildas de outros mestres</Typography
      >

      <GuildList v-if="joinedGuilds.length > 0" :guilds="joinedGuilds" />

      <Typography @click="addNewGuild" class="add-guild">
        {{ isGuildMaster(player) ? 'entrar' : 'adicionar' }}
        <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </Typography>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.guilds-index {
  flex: 1;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
  width: 100%;
  padding: 0 1.5rem 2rem;

  @media (min-width: 700px) {
    flex-direction: row;
    justify-content: center;

    padding-block: 1rem;

    .group {
      flex: 1;
      padding-inline: 1.5rem;
    }
  }

  .group {
    flex-direction: column;
    gap: inherit;
    align-items: stretch;

    max-width: 40rem;
  }

  .heading {
    gap: 0.7rem;
    align-items: center;

    svg {
      font-size: 1.2rem;
    }
  }

  .sub-heading {
    color: var(--tx-trans-3);
    font-weight: 500;
    margin-top: -0.7rem;
  }

  .no-guilds {
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    text-align: justify;

    .title {
      align-self: flex-start;
    }

    .sad-dragon {
      width: 9rem;
    }
  }

  .add-guild {
    color: var(--tx-main);
    gap: 0.3rem;
    align-items: center;
    align-self: flex-end;
    cursor: pointer;

    background-color: var(--bg-main-lighter);
    padding: 0.5rem 1rem;
    border-radius: $border-radius;
    transition: all 100ms;

    font-weight: 500;

    &:hover {
      filter: brightness(1.02);
    }

    svg {
      font-size: 0.9rem;
    }
  }

  .ask-for-invite-hint {
    text-align: center;
    margin-top: 2rem;
    color: var(--tx-trans-3);
    font-size: 0.9rem;
  }

  .enter-new-guild-button {
    margin-top: 1rem;
  }
}
</style>
