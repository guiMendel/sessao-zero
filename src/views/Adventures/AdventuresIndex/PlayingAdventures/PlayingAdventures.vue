<script setup lang="ts">
import { Vase } from '@/api'
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { useCurrentPlayer } from '@/api/players'
import { Button, Divisor, Typography } from '@/components'
import { Resource } from '@/firevase/resources'
import { computed, toValue } from 'vue'
import { useRouter } from 'vue-router'
import { AdventurePreview } from '../AdventurePreview'
import cricketImage from '@/assets/cricket.png'

const props = defineProps<{
  adventures: Resource<Vase, 'adventures'>[]
  isNarrator: boolean
}>()

const emit = defineEmits(['request-narration'])

const { guild } = useCurrentGuild()
const { player } = useCurrentPlayer()

/** As aventuras das quais o jogador faz parte */
const activeAdventures = computed(() =>
  props.adventures.filter((adventure) => isMember(player.value, adventure))
)

/** As aventuras das quais o jogador não faz parte */
const otherAdventures = computed(() =>
  props.adventures
    .filter((adventure) => !isMember(player.value, adventure))
    .sort((adventureA, adventureB) => {
      const aOpen =
        adventureA.open &&
        (adventureA.playerLimit < 0 ||
          adventureA.playerLimit > toValue(adventureA.players).length)
      const bOpen =
        adventureB.open &&
        (adventureB.playerLimit < 0 ||
          adventureB.playerLimit > toValue(adventureB.players).length)

      if (aOpen === bOpen) return 0
      return aOpen ? -1 : 1
    })
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

    <template v-if="activeAdventures.length > 0">
      <AdventurePreview
        v-for="adventure in activeAdventures"
        :adventure-id="adventure.id"
      />

      <Divisor class="active-divisor" />
    </template>

    <!-- Aventuras da guilda -->
    <AdventurePreview
      v-for="adventure in otherAdventures"
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
  padding-top: 1rem;

  .active-divisor {
    color: var(--tx-main);
    margin-block: 0.8rem;
  }

  .cricket-image {
    width: 60%;
    align-self: center;
  }
}
</style>
