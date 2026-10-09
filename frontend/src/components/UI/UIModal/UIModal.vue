<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      @click="emit('close')"
    >
      <div
        class="w-full max-w-md border border-hairline bg-paper p-5 shadow-none"
        @click.stop
      >
        <div class="mb-4 border-b border-hairline pb-3">
          <h2 class="font-serif text-xl">{{ title }}</h2>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  isShow?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>
