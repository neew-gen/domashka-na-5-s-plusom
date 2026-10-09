<template>
  <button
    class="inline-flex items-center justify-center border text-sm font-medium transition"
    :class="[sizeClasses, variantClasses]"
    :disabled="disabled"
    :type="type"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'danger'
    size?: 'md' | 'sm' | 'icon'
    disabled?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'ghost',
    size: 'md',
    disabled: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  click: []
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'icon':
      return 'h-7 w-7 shrink-0 px-0'
    case 'sm':
      return 'h-7 shrink-0 px-2 text-xs'
    case 'md':
    default:
      return 'h-9 px-3'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'border-ink bg-ink text-paper hover:opacity-90 disabled:opacity-40'
    case 'danger':
      return 'border-accent text-accent hover:bg-accent/5 disabled:opacity-40'
    case 'ghost':
    default:
      return 'border-hairline text-ink hover:border-ink disabled:opacity-40'
  }
})
</script>
