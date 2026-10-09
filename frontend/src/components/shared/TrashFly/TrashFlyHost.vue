<template>
  <div class="trash-fly-host" aria-hidden="true" />
</template>

<script setup lang="ts">
</script>

<style>
.trash-fly-target--catch {
  animation: trash-fly-catch 620ms ease;
}

@keyframes trash-fly-catch {
  0%,
  100% {
    color: inherit;
  }

  45% {
    color: var(--color-accent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .trash-fly-target--catch {
    animation: none;
  }
}
</style>
