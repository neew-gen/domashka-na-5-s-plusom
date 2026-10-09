<template>
  <RouterView />
  <SuccessBurstHost />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import SuccessBurstHost from '@/components/shared/SuccessBurst/SuccessBurstHost.vue'
</script>
