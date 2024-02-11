<script setup lang="ts">
import { useAdventure } from '@/api/adventures'
import genericBanner from '@/assets/rpg-table.png'
import { LoadingSpinner, Typography } from '@/components'
import { toValue, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ adventureId: string }>()
const { sync } = useAdventure()

const adventure = sync(props.adventureId)

watch(props, () => {
  sync(props.adventureId, { existingRef: adventure })
})

const router = useRouter()

const open = () =>
  router.push({ name: 'adventure', params: { adventureId: props.adventureId } })
</script>

<template>
  <div class="adventure-preview" @click="open">
    <LoadingSpinner v-if="!adventure" />

    <template v-else>
      <img class="cover" :src="genericBanner" alt="capa da aventura" />

      <!-- Narrators -->
      <LoadingSpinner
        class="narrator-loading"
        v-if="toValue(adventure.narrators).length === 0"
      />

      <div v-else class="narrators">
        <Typography
          class="narrator"
          v-for="narrator in toValue(adventure.narrators)"
          :key="narrator.id"
          variant="paragraph-secondary"
          >{{ narrator.nickname }}</Typography
        >
      </div>

      <div class="header">
        <!-- Title -->
        <Typography variant="subtitle">{{ adventure.name }}</Typography>

        <div class="info">
          <!-- Numero de jogadores -->
          <div class="players">
            <Typography class="count">{{
              toValue(adventure.players).length
            }}</Typography
            ><Typography class="limit" v-if="adventure.playerLimit > 0"
              >/{{ adventure.playerLimit }}</Typography
            >

            <font-awesome-icon class="icon" :icon="['fas', 'user-group']" />
          </div>
        </div>
      </div>

      <!-- Descricao -->
      <Typography class="description">{{ adventure.description }}</Typography>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.adventure-preview {
  flex-direction: column;
  gap: 0.5rem;
  border-radius: $border-radius;
  background-color: var(--bg-main-light);
  overflow: hidden;
  @include bevel(var(--main));

  .narrator-loading {
    font-size: 0.8rem;
  }

  .narrators {
    padding-inline: 0.8rem;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;

    color: var(--tx-trans-3);
    margin-bottom: -0.3rem;
  }

  .header {
    align-items: center;
    padding-inline: 0.8rem;
    flex-wrap: wrap;

    .info {
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;

      .players {
        align-items: center;
        font-weight: 500;
        color: var(--tx-trans-3);

        .count {
          color: var(--tx-main-dark);
        }

        .limit {
          font-size: 0.7em;
        }

        .icon {
          margin-left: 0.5rem;
        }
      }
    }
  }

  .description {
    text-align: left;
    padding-inline: 0.8rem;
    padding-bottom: 0.8rem;
  }
}
</style>
