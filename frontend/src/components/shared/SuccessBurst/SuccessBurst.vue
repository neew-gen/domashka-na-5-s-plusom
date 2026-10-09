<template>
  <div
    class="success-burst"
    :style="{ left: `${x}px`, top: `${y}px` }"
    aria-hidden="true"
  >
    <span
      v-for="angle in SUCCESS_BURST_RAY_ANGLES"
      :key="angle"
      class="success-burst__ray"
      :style="{ '--angle': `${angle}deg` }"
    />
  </div>
</template>

<script setup lang="ts">
import { SUCCESS_BURST_RAY_ANGLES } from '@/libs/constants/success-burst.constant'

defineProps<{
  x: number
  y: number
}>()
</script>

<style scoped>
.success-burst {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

.success-burst__ray {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 14px;
  margin-left: -1px;
  margin-top: -14px;
  border-radius: 999px;
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--color-success) 10%, transparent),
    var(--color-success)
  );
  box-shadow: 0 0 8px color-mix(in srgb, var(--color-success) 60%, transparent);
  opacity: 0;
  transform-origin: center bottom;
  animation: success-ray-burst 560ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes success-ray-burst {
  0% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(4px) scaleY(0.25);
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(-26px) scaleY(1.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .success-burst__ray {
    animation: none;
    opacity: 0;
  }
}
</style>
