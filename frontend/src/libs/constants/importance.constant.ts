import type { TImportance } from '@/libs/types/task.type'

export const IMPORTANCE_LABELS: Record<TImportance, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая',
}

export const IMPORTANCE_OPTIONS: { value: TImportance; label: string }[] = (
  Object.entries(IMPORTANCE_LABELS) as [TImportance, string][]
).map(([value, label]) => ({ value, label }))

export const IMPORTANCE_CLASS: Record<TImportance, string> = {
  low: 'text-importance-low',
  medium: 'text-importance-medium',
  high: 'text-importance-high',
}

export const WEEKDAY_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'] as const
