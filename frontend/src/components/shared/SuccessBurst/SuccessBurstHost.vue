<template>
  <Teleport to="body">
    <div class="success-burst-host" aria-hidden="true">
      <SuccessBurst
        v-for="burst in successBursts"
        :key="burst.id"
        :x="burst.x"
        :y="burst.y"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import SuccessBurst from '@/components/shared/SuccessBurst/SuccessBurst.vue'
import { successBursts } from '@/libs/classes/success-burst-lib'
</script>

<style scoped>
.success-burst-host {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  pointer-events: none;
  overflow: visible;
}
</style>
