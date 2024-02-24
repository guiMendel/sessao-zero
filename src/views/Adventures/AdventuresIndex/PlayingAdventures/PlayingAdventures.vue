<script setup lang="ts">
import { Vase } from '@/api'
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { useCurrentPlayer } from '@/api/players'
import cricketImage from '@/assets/cricket.png'
import { Button, Typography } from '@/components'
import { Resource } from '@/firevase/resources'
import { computed, toValue } from 'vue'
import { useRouter } from 'vue-router'
import { AdventurePreview } from '../AdventurePreview'

const props = defineProps<{
  adventures: Resource<Vase, 'adventures'>[]
  isNarrator: boolean
}>()

const emit = defineEmits(['request-narration'])

const { guild } = useCurrentGuild()
const { player } = useCurrentPlayer()

/**
 * Retorna a prioridade de uma aventura em aparecer primeiro.
 * Numeros menores tem maior prioridade
 */
const adventureSortPriority = (adventure: Resource<Vase, 'adventures'>) => {
  // If member, highest priority
  if (isMember(player.value, adventure)) return 0

  // If it's enterable
  if (
    adventure.open &&
    (adventure.playerLimit < 0 ||
      adventure.playerLimit > toValue(adventure.players).length)
  )
    return 1

  // If it's not enterable
  return 2
}

/** As aventuras das quais o jogador não faz parte */
const sortedAdventures = computed(() =>
  props.adventures.sort(
    (adventureA, adventureB) =>
      adventureSortPriority(adventureA) - adventureSortPriority(adventureB)
  )
)

const isPlayerMember = computed(() => isMember(player.value, guild.value))

const router = useRouter()

const createNewAdventure = () => router.push({ name: 'create-adventure' })
</script>

<template>
  <div class="playing-adventures">
    <template v-if="adventures.length === 0">
      <Typography variant="paragraph" class="no-adventures-text"
        >(vazio)</Typography
      >

      <img :src="cricketImage" alt="papel em branco" class="cricket-image" />

      <!-- Prompt de virar narrador -->
      <Button
        v-if="isPlayerMember"
        @click="
          () => (isNarrator ? emit('request-narration') : createNewAdventure())
        "
        variant="colored"
      >
        <font-awesome-icon :icon="['fas', 'book-open']" />
        {{ isNarrator ? 'narrar' : 'torne-se narrador' }}</Button
      >
    </template>

    <!-- Aventuras da guilda -->
    <AdventurePreview
      v-for="adventure in sortedAdventures"
      :adventure-id="adventure.id"
    />
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.playing-adventures {
  top: 0;
  left: 0;
  right: 0;
  flex-direction: column;
  align-items: stretch;
  gap: 2rem;
  padding-top: 2rem;

  @media (min-width: 700px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: center;
  }

  .active-divisor {
    color: var(--tx-main);
    margin-block: 0.8rem;

    @media (min-width: 700px) {
      margin-block: 1rem;
      font-size: 0.6rem;
    }
  }

  .cricket-image {
    width: 60%;
    align-self: center;
  }
}
</style>
