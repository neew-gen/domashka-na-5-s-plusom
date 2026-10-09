<template>
  <div
    ref="rootEl"
    class="relative text-sm"
    :class="compact ? 'inline-flex' : 'flex w-full flex-col gap-1'"
  >
    <span v-if="label" class="font-medium tracking-wide">{{ label }}</span>
    <button
      ref="triggerEl"
      type="button"
      :class="triggerClass"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span :class="{ 'text-ink/40': !model && !compact }">{{ displayValue }}</span>
      <span v-if="!compact" class="text-ink/40" aria-hidden="true">▾</span>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="panelEl"
        class="z-[70] border border-hairline bg-paper p-2"
        :style="floatingStyles"
      >
        <div class="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            class="border border-hairline px-2 py-0.5 text-xs hover:border-ink"
            @click="shiftMonth(-1)"
          >
            Назад
          </button>
          <p class="font-serif text-sm">{{ monthTitle }}</p>
          <button
            type="button"
            class="border border-hairline px-2 py-0.5 text-xs hover:border-ink"
            @click="shiftMonth(1)"
          >
            Вперёд
          </button>
        </div>

        <div
          class="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wider text-ink/50"
        >
          <span v-for="day in WEEKDAY_SHORT_FULL" :key="day">{{ day }}</span>
        </div>

        <div class="grid grid-cols-7 gap-0.5">
          <template v-for="(cell, index) in calendarCells" :key="index">
            <span v-if="!cell" class="h-7" />
            <button
              v-else
              type="button"
              class="h-7 border text-xs hover:border-ink"
              :class="dayClasses(cell)"
              @click="selectDay(cell)"
            >
              {{ DateLib.parseIso(cell).getDate() }}
            </button>
          </template>
        </div>

        <div class="mt-2 flex justify-start">
          <button
            type="button"
            class="border border-hairline px-2 py-1 text-xs hover:border-ink"
            @click="clearDate"
          >
            Очистить
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/vue'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

import { DateLib } from '@/libs/classes/date-lib'
import { MONTH_NAMES_RU, WEEKDAY_SHORT_FULL } from '@/libs/constants/date.constant'

const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    label?: string
    compact?: boolean
  }>(),
  {
    label: '',
    compact: false,
  },
)

const isOpen = ref(false)
const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())
const rootEl = useTemplateRef('rootEl')
const triggerEl = useTemplateRef<HTMLButtonElement>('triggerEl')
const panelEl = useTemplateRef<HTMLElement>('panelEl')
const todayIso = DateLib.toIsoDate(new Date())

const triggerClass = computed(() => {
  if (props.compact) {
    return 'inline-flex items-center bg-transparent p-0 text-left text-xs text-ink/50 outline-none'
  }
  return 'box-border flex h-9 w-full items-center justify-between border border-hairline bg-paper px-3 text-left text-sm text-ink outline-none hover:border-ink focus:border-ink'
})

const displayValue = computed(() => {
  if (!model.value) return props.compact ? 'Срок' : 'Не выбрана'
  if (props.compact) {
    return `до ${DateLib.parseIso(model.value).toLocaleDateString('ru-RU')}`
  }
  return DateLib.formatFullDate(DateLib.parseIso(model.value))
})

const monthTitle = computed(() => `${MONTH_NAMES_RU[viewMonth.value]} ${viewYear.value}`)

const calendarCells = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const leading = DateLib.mondayIndex(first)
  const totalDays = DateLib.daysInMonth(viewYear.value, viewMonth.value)
  const cells: (string | null)[] = []
  for (let index = 0; index < leading; index += 1) {
    cells.push(null)
  }
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(DateLib.toIsoDate(new Date(viewYear.value, viewMonth.value, day)))
  }
  return cells
})

const { floatingStyles } = useFloating(triggerEl, panelEl, {
  open: isOpen,
  strategy: 'fixed',
  whileElementsMounted: autoUpdate,
  placement: 'bottom-end',
  middleware: [
    offset(4),
    flip({ padding: 8 }),
    shift({ padding: 8 }),
    size({
      padding: 8,
      apply({ elements }) {
        Object.assign(elements.floating.style, {
          width: '280px',
        })
      },
    }),
  ],
})

const dayClasses = (cell: string) => {
  if (cell === model.value) return 'border-ink bg-ink text-paper'
  if (cell === todayIso) {
    return 'border-ink underline decoration-1 underline-offset-2 hover:bg-ink/[0.04]'
  }
  return 'border-transparent hover:bg-ink/[0.04]'
}

const syncViewFromModel = () => {
  const base = model.value ? DateLib.parseIso(model.value) : new Date()
  viewYear.value = base.getFullYear()
  viewMonth.value = base.getMonth()
}

const toggle = () => {
  if (!isOpen.value) {
    syncViewFromModel()
    isOpen.value = true
    return
  }
  isOpen.value = false
}

const shiftMonth = (delta: number) => {
  const next = new Date(viewYear.value, viewMonth.value + delta, 1)
  viewYear.value = next.getFullYear()
  viewMonth.value = next.getMonth()
}

const selectDay = (iso: string) => {
  model.value = iso
  isOpen.value = false
}

const clearDate = () => {
  model.value = ''
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
