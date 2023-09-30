<script lang="ts" setup>
import { useGuildAPI } from '@/api';
import { toValue } from 'vue';

const { create, syncList, deleteForever } = useGuildAPI()

const newGuild = () => {
  const name = prompt('Nome da guilda')

  if (name == undefined) return

  create(name)
}

const guilds = syncList()
</script>

<template>
  <div class="guilds">
    <button @click="newGuild">New Guild</button>

    <div class="guild" v-for="guild in guilds" :key="guild.id">
      <!-- <b>{{ getGuildOwnerName(guild) }}</b> — -->
      <!-- <p>{{ inspect(guild.owner.value)?.name ?? 'loading...' }}</p> -->
      <p>{{ toValue(guild.owner)?.name ?? 'loading...' }}</p>
      <p>{{ guild.name }}</p>
      <font-awesome-icon
        :icon="['fas', 'xmark']"
        @click="deleteForever(guild.id)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.guilds {
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  border: 3px solid var(--gray-light);
  border-radius: 10px;
  padding: 2rem;

  .guild {
    align-items: center;
    gap: 0.5rem;

    svg {
      cursor: pointer;
    }
  }
}
</style>
