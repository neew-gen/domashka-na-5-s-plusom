<template>
  <section class="min-w-0 overflow-hidden border border-hairline p-3">
    <h2 class="mb-2 font-serif text-base text-ink/70">Сводка</h2>
    <div class="flex items-center gap-3 sm:gap-4">
      <div class="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
        <svg viewBox="0 0 36 36" class="h-full w-full -rotate-90" aria-hidden="true">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="text-hairline"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            pathLength="100"
            stroke-dasharray="100"
            :stroke-dashoffset="100 - stats.completion_percent"
            stroke-linecap="round"
            class="donut-arc text-success"
            :class="{ 'donut-arc--motion': allowMotion }"
          />
        </svg>
        <div
          class="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-sm"
          :class="{ 'text-success': stats.completion_percent > 0 }"
        >
          <span class="stat-flip">
            <Transition name="stat-flip" :css="allowMotion">
              <span :key="stats.completion_percent" class="stat-flip__value">
                {{ stats.completion_percent }}%
              </span>
            </Transition>
          </span>
        </div>
      </div>
      <dl class="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-1 text-sm sm:gap-x-6">
        <div class="min-w-0">
          <dt class="text-xs text-ink/50">Всего задач</dt>
          <dd class="font-serif text-lg sm:text-xl">
            <span class="stat-flip">
              <Transition name="stat-flip" :css="allowMotion">
                <span :key="stats.total" class="stat-flip__value">{{ stats.total }}</span>
              </Transition>
            </span>
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs text-ink/50">Выполнено</dt>
          <dd
            class="font-serif text-lg sm:text-xl"
            :class="{ 'text-success': stats.done > 0 }"
          >
            <span class="stat-flip">
              <Transition name="stat-flip" :css="allowMotion">
                <span :key="stats.done" class="stat-flip__value">{{ stats.done }}</span>
              </Transition>
            </span>
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs text-ink/50">Не выполнено</dt>
          <dd class="font-serif text-lg sm:text-xl">
            <span class="stat-flip">
              <Transition name="stat-flip" :css="allowMotion">
                <span :key="stats.not_done" class="stat-flip__value">{{ stats.not_done }}</span>
              </Transition>
            </span>
          </dd>
        </div>
        <div class="min-w-0">
          <dt class="text-xs text-ink/50">Процент выполнения</dt>
          <dd
            class="font-serif text-lg sm:text-xl"
            :class="{ 'text-success': stats.completion_percent > 0 }"
          >
            <span class="stat-flip inline-block">
              <span ref="percentRef" class="inline-block">
                {{ stats.completion_percent }}%
              </span>
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUpdate, ref, useTemplateRef } from 'vue'

import { spawnSuccessBurst } from '@/libs/classes/success-burst-lib'
import type { TWeekStats } from '@/libs/types/task.type'

const props = defineProps<{
  stats: TWeekStats
}>()

const percentRef = useTemplateRef('percentRef')
const allowMotion = ref(false)
let lastPercent = props.stats.completion_percent
let lastDone = props.stats.done
let lastTotal = props.stats.total

onBeforeUpdate(() => {
  const nextPercent = props.stats.completion_percent
  const nextDone = props.stats.done
  const nextTotal = props.stats.total

  if (!allowMotion.value) {
    lastPercent = nextPercent
    lastDone = nextDone
    lastTotal = nextTotal
    void nextTick(() => {
      allowMotion.value = true
    })
    return
  }

  const shouldFlash =
    nextPercent > lastPercent && nextDone > lastDone && nextTotal === lastTotal

  if (shouldFlash) {
    void nextTick(() => {
      const el = percentRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      spawnSuccessBurst(rect.left + rect.width / 2, rect.top + rect.height / 2)
    })
  }

  lastPercent = nextPercent
  lastDone = nextDone
  lastTotal = nextTotal
})
</script>

<style scoped>
.donut-arc--motion {
  transition: stroke-dashoffset 500ms ease;
}

.stat-flip {
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  line-height: 1.2;
  min-height: 1.2em;
  min-width: 2ch;
  font-variant-numeric: tabular-nums;
}

.stat-flip__value {
  display: inline-block;
}

.stat-flip-enter-active,
.stat-flip-leave-active {
  transition:
    transform 320ms ease,
    opacity 320ms ease;
}

.stat-flip-leave-active {
  position: absolute;
  left: 0;
  top: 0;
}

.stat-flip-enter-from {
  transform: translateY(110%);
  opacity: 0;
}

.stat-flip-leave-to {
  transform: translateY(-110%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .donut-arc--motion {
    transition: none;
  }

  .stat-flip-enter-active,
  .stat-flip-leave-active {
    transition: none;
  }
}
</style>
