<template>
  <label class="flex w-full flex-col gap-1 text-sm">
    <span v-if="label" class="font-medium tracking-wide">{{ label }}</span>
    <input
      v-model="model"
      class="box-border w-full border border-hairline bg-paper text-sm text-ink outline-none focus:border-ink"
      :class="sizeClasses"
      :type="type"
      :lang="lang"
      :placeholder="placeholder"
      :required="required"
      :maxlength="maxlength"
      @keydown.enter="emit('enter')"
    />
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    label?: string
    type?: string
    lang?: string
    placeholder?: string
    required?: boolean
    size?: 'md' | 'sm'
    maxlength?: number
  }>(),
  {
    label: '',
    type: 'text',
    lang: 'ru',
    placeholder: '',
    required: false,
    size: 'md',
  },
)

const emit = defineEmits<{
  enter: []
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-7 px-2'
    case 'md':
    default:
      return 'h-9 px-3'
  }
})
</script>
