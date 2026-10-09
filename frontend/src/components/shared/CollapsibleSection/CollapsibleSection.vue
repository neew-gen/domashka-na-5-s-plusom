<template>
  <section class="min-w-0 border-b border-hairline pb-4">
    <div class="flex min-w-0 items-center justify-between gap-3">
      <button
        v-if="collapsible"
        type="button"
        class="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-left"
        @click="isOpen = !isOpen"
      >
        <span class="font-serif text-lg" :class="titleClass">{{ title }}</span>
        <span v-if="!isOpen" class="min-w-0 text-sm text-ink/55">
          <slot name="summary" />
        </span>
      </button>
      <h1 v-else class="min-w-0 font-serif text-2xl" :class="titleClass">{{ title }}</h1>
      <div class="flex shrink-0 items-center gap-3">
        <slot v-if="isOpen" name="actions" />
        <button
          v-if="collapsible"
          type="button"
          class="text-xs uppercase tracking-wider text-ink/50 hover:text-ink"
          @click="isOpen = !isOpen"
        >
          {{ isOpen ? 'скрыть' : 'показать' }}
        </button>
      </div>
    </div>
    <div v-if="isOpen" class="mt-3 min-w-0">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    titleClass?: string
    defaultOpen?: boolean
    collapsible?: boolean
  }>(),
  {
    titleClass: '',
    defaultOpen: true,
    collapsible: true,
  },
)

const isOpen = ref(props.defaultOpen)
</script>
