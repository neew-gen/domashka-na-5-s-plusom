<template>
  <UIModal :title="title" :is-show="true" @close="emit('close')">
    <p class="mb-1 font-serif text-sm">{{ task.title }}</p>
    <p class="mb-3 text-sm text-ink/70">{{ task.description }}</p>
    <UISelect v-model="selectedDate" label="День" :options="dayOptions" />
    <div class="mt-4 flex justify-end gap-2">
      <UIButton @click="emit('close')">Отмена</UIButton>
      <UIButton
        variant="primary"
        :disabled="!selectedDate"
        @click="emit('confirm', selectedDate)"
      >
        {{ confirmLabel }}
      </UIButton>
    </div>
  </UIModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import UIButton from '@/components/UI/UIButton/UIButton.vue'
import UIModal from '@/components/UI/UIModal/UIModal.vue'
import UISelect from '@/components/UI/UISelect/UISelect.vue'
import { WEEKDAY_SHORT } from '@/libs/constants/importance.constant'
import { DateLib } from '@/libs/classes/date-lib'
import { useBoardStore } from '@/libs/stores/modules/board.store'
import type { TTask } from '@/libs/types/task.type'

const props = withDefaults(
  defineProps<{
    task: TTask
    title?: string
    confirmLabel?: string
  }>(),
  {
    title: 'Перенести задачу',
    confirmLabel: 'Перенести',
  },
)

const emit = defineEmits<{
  close: []
  confirm: [string]
}>()

const board = useBoardStore()
const selectedOverride = ref<string | null>(null)

const dayOptions = computed(() =>
  board.workdays.map((day) => {
    const value = DateLib.toIsoDate(day)
    const weekday = WEEKDAY_SHORT[DateLib.mondayIndex(day)]
    return {
      value,
      label: `${weekday}, ${DateLib.formatDayMonth(day)}`,
    }
  }),
)

const selectedDate = computed({
  get: () => {
    const options = dayOptions.value
    const preferred = selectedOverride.value ?? props.task.task_date
    if (options.some((item) => item.value === preferred)) return preferred
    return options[0]?.value ?? ''
  },
  set: (value: string) => {
    selectedOverride.value = value
  },
})
</script>
