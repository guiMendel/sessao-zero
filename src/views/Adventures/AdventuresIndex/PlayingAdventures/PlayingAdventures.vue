<script setup lang="ts">
import { Vase } from '@/api'
import { useCurrentGuild } from '@/api/guilds'
import { isMember } from '@/api/isMember'
import { useCurrentPlayer } from '@/api/players'
import { Button, Typography } from '@/components'
import { Resource } from '@/firevase/resources'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AdventurePreview } from '../AdventurePreview'
import cricketImage from '@/assets/cricket.png'

defineProps<{
  adventures: Resource<Vase, 'adventures'>[]
  isNarrator: boolean
}>()

const emit = defineEmits(['request-narration'])

const { guild } = useCurrentGuild()
const { player } = useCurrentPlayer()

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
      v-for="adventure in adventures"
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
  gap: 1rem;
  padding-top: 1rem;

  .cricket-image {
    width: 60%;
    align-self: center;
  }
}
</style>
