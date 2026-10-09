<template>
  <div
    ref="rootEl"
    class="relative text-sm"
    :class="isPlain ? 'inline-flex' : 'flex w-full flex-col gap-1'"
  >
    <span v-if="label" class="font-medium tracking-wide">{{ label }}</span>
    <button
      ref="triggerEl"
      type="button"
      :class="triggerClass"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span>{{ selectedLabel }}</span>
      <span v-if="!isPlain" class="text-ink/40" aria-hidden="true">▾</span>
    </button>

    <Teleport to="body">
      <ul
        v-if="isOpen"
        ref="panelEl"
        class="z-[70] max-h-56 overflow-auto border border-hairline bg-paper"
        role="listbox"
        :style="floatingStyles"
      >
        <li v-for="option in options" :key="option.value" role="option">
          <button
            type="button"
            class="w-full px-3 py-2 text-left hover:bg-ink/[0.04]"
            :class="{ 'bg-ink/[0.06] font-medium': option.value === model }"
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </button>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/vue'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    label?: string
    options: { value: string; label: string }[]
    variant?: 'default' | 'plain'
  }>(),
  {
    label: '',
    variant: 'default',
  },
)

const isOpen = ref(false)
const rootEl = useTemplateRef('rootEl')
const triggerEl = useTemplateRef<HTMLButtonElement>('triggerEl')
const panelEl = useTemplateRef<HTMLElement>('panelEl')

const isPlain = computed(() => props.variant === 'plain')

const triggerClass = computed(() => {
  if (isPlain.value) {
    return 'inline-flex items-center bg-transparent p-0 text-left text-xs uppercase tracking-wider text-inherit outline-none'
  }
  return 'box-border flex h-9 w-full items-center justify-between border border-hairline bg-paper px-3 text-left text-sm text-ink outline-none hover:border-ink focus:border-ink'
})

const selectedLabel = computed(() => {
  const match = props.options.find((option) => option.value === model.value)
  return match?.label ?? ''
})

const { floatingStyles } = useFloating(triggerEl, panelEl, {
  open: isOpen,
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
  placement: 'bottom-start',
  middleware: [
    offset(4),
    flip({ padding: 8 }),
    shift({ padding: 8 }),
    size({
      padding: 8,
      apply({ rects, elements }) {
        const minWidth = isPlain.value
          ? Math.max(rects.reference.width, 8.5 * 16)
          : rects.reference.width
        Object.assign(elements.floating.style, {
          minWidth: `${minWidth}px`,
          width: isPlain.value ? 'max-content' : `${rects.reference.width}px`,
        })
      },
    }),
  ],
})

const toggle = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (value: string) => {
  model.value = value
  isOpen.value = false
}

const onDocumentPointer = (event: Event) => {
  const target = event.target
  if (!(target instanceof Node)) return
  if (rootEl.value?.contains(target) || panelEl.value?.contains(target)) return
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointer)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointer)
})
</script>
