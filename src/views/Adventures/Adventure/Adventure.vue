<script setup lang="ts">
import genericBanner from '@/assets/rpg-table.png'
import { useCurrentAdventure } from '@/api/adventures/useCurrentAdventure'
import { LoadingSpinner, Typography } from '@/components'

const { adventure } = useCurrentAdventure()
</script>

<template>
  <LoadingSpinner v-if="!adventure" />

  <div v-else class="adventure">
    <img :src="genericBanner" alt="capa da aventura" />

    <div class="content">
      <Typography class="subheader">aventura</Typography>

      <Typography variant="title" class="title">{{
        adventure.name
      }}</Typography>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.adventure {
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  .content {
    padding-inline: 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }

  .title {
    color: var(--tx-main);
  }

  .subheader {
    color: var(--tx-trans-3);
    font-weight: 500;
    margin-block: -0.2rem;
  }
}
</style>
