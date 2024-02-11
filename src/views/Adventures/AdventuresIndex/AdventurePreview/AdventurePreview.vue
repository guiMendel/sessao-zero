<script setup lang="ts">
import { useAdventure } from '@/api/adventures'
import genericBanner from '@/assets/rpg-table.png'
import { LoadingSpinner, Typography } from '@/components'
import { computed, ref, toValue, watch } from 'vue'
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

// ========================================
// DESCRIPTION CROPPING
// ========================================

/** Quantidade de caracteres a partir da qual dar crop na descricao */
const descriptionCropLength = 200

const shouldCropDescription = computed(() =>
  Boolean(
    adventure.value &&
      adventure.value.description.length > descriptionCropLength &&
      shouldExpandDescription.value === false
  )
)

const shouldExpandDescription = ref(false)

const expandDescription = (event: Event) => {
  if (shouldCropDescription.value == false) return

  shouldExpandDescription.value = true

  event.stopPropagation()
}
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
      <Typography
        class="description"
        :class="{ cropped: shouldCropDescription }"
        @click="expandDescription"
        >{{
          shouldCropDescription
            ? adventure.description.slice(0, descriptionCropLength).trim() + '…'
            : adventure.description
        }}</Typography
      >

      <div
        v-if="shouldCropDescription"
        @click="expandDescription"
        class="expand-button"
      >
        expandir
      </div>
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
  @include high-contrast-border;
  position: relative;

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
    position: relative;
    white-space: pre-wrap;

    &.cropped {
      white-space: normal;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        z-index: 20;

        background: linear-gradient(
          180deg,
          var(--trans) 0%,
          var(--bg-main-light) 70%
        );
      }
    }
  }

  .expand-button {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    translate: -50% 0;

    font-size: 0.9rem;
    z-index: 50;
    background-color: var(--main-lighter);
    padding: 0.3rem;
    min-width: 7rem;
    justify-content: center;
    border-radius: $border-radius;
    font-weight: 500;
    color: var(--tx-main);
    @include high-contrast-border;
  }
}
</style>
