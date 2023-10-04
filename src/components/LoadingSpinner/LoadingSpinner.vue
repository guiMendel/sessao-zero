<template>
  <div class="spinner">
    <font-awesome-icon class="loading-spinner" :icon="['fas', 'compass']" />
  </div>
</template>

<style lang="scss" scoped>
.spinner {
  animation: spin 1s ease-in-out infinite alternate,
    change-hue 1.5s linear infinite;
  color: hsl(118, 100%, 50%);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min-content;
  border-radius: 50%;
  padding: 0.1rem;
  font-size: 1.2rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(450deg);
  }
}

@keyframes change-hue {
  from {
    filter: hue-rotate(0deg);
  }

  to {
    filter: hue-rotate(360deg);
  }
}
</style>
