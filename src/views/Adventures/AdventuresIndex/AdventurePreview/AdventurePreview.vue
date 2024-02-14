<script setup lang="ts">
import { isNarrator, useAdventure } from '@/api/adventures'
import { isMember } from '@/api/isMember'
import { useCurrentPlayer } from '@/api/players'
import genericBanner from '@/assets/green-table.png'
import { LoadingSpinner, Typography } from '@/components'
import { computed, ref, toValue, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ adventureId: string }>()
const { sync } = useAdventure()
const { player } = useCurrentPlayer()

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

const isClosed = computed(
  () =>
    adventure.value &&
    player.value &&
    !isMember(player.value, adventure.value) &&
    (!adventure.value.open ||
      (adventure.value.playerLimit > 0 &&
        adventure.value.playerLimit <= toValue(adventure.value.players).length))
)
</script>

<template>
  <div class="adventure-preview" @click="open" :class="{ closed: isClosed }">
    <LoadingSpinner v-if="!adventure" />

    <template v-else>
      <!-- Medalha de membro -->
      <Typography
        variant="paragraph-secondary"
        class="member-badge"
        v-if="
          player &&
          isMember(player, adventure) &&
          !isNarrator(player.id, adventure)
        "
      >
        <font-awesome-icon :icon="['fas', 'circle-check']" />
        jogando
      </Typography>

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
          <!-- Caso estiver trancado -->
          <font-awesome-icon
            v-if="!adventure.open"
            :icon="['fas', 'lock']"
            class="padlock"
          />

          <!-- Indicador de requer admissao -->
          <div class="require-admission" v-if="adventure.requireAdmission">
            <font-awesome-icon :icon="['fas', 'envelope']" />
          </div>

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
  @include bevel(var(--main));
  @include high-contrast-border;
  position: relative;

  --crop-overlay: var(--bg-main-light);

  &.closed {
    background-color: var(--bg-gray-lighter);
    color: var(--tx-gray-dark);
    @include bevel(var(--gray-light));
    --crop-overlay: var(--bg-gray-lighter);

    .header .info {
      .padlock {
        color: var(--tx-gray-darker);
      }

      .players .count {
        color: var(--tx-gray-dark);
      }
    }

    .expand-button {
      background-color: var(--tx-gray-light);
      color: var(--tx-gray-dark);
    }
  }

  .cover {
    border-radius: $border-radius $border-radius 0 0;
  }

  .member-badge {
    position: absolute;
    top: -0.8rem;
    left: 1rem;

    align-items: center;
    gap: 0.3rem;

    background-color: var(--bg-main);
    color: var(--tx-white);
    font-weight: 600;
    @include bevel(var(--main-dark));
    border-radius: $border-radius;
    padding: 0.3rem 0.6rem;
  }

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
    gap: 0.2rem;

    .info {
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;

      .padlock {
        color: var(--tx-main-darker);
      }

      .require-admission {
        background-color: var(--bg-warning);
        width: 1.7rem;
        height: 1.7rem;
        align-items: center;
        justify-content: center;
        border-radius: 50%;

        color: var(--tx-warning-darker);
      }

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
        border-radius: 0 0 $border-radius $border-radius;

        background: linear-gradient(
          180deg,
          var(--trans) 0%,
          var(--crop-overlay) 70%
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
