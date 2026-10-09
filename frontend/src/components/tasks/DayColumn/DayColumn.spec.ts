import { mount } from '@vue/test-utils'

import DayColumn from '@/components/tasks/DayColumn/DayColumn.vue'
import type { TTask } from '@/libs/types/task.type'

const makeTask = (overrides: Partial<TTask> = {}): TTask => ({
  id: 1,
  title: 'Задача дня',
  description: 'Описание задачи дня',
  importance: 'medium',
  task_date: '2026-10-06',
  deadline: null,
  is_done: false,
  position: 0,
  deleted_at: null,
  created_at: '2026-10-06T10:00:00Z',
  ...overrides,
})

describe('DayColumn', () => {
  it('shows updated task state after remount with new props', () => {
    const day = new Date(2026, 9, 6)
    const first = mount(DayColumn, {
      props: { day, tasks: [makeTask()], canDrag: false },
      global: { stubs: { teleport: true } },
    })
    expect(first.find('[aria-label="Выполнено"]').exists()).toBe(true)
    first.unmount()

    const second = mount(DayColumn, {
      props: { day, tasks: [makeTask({ is_done: true })], canDrag: false },
      global: { stubs: { teleport: true } },
    })
    expect(second.find('[aria-label="Вернуть"]').exists()).toBe(true)
    expect(second.text()).toContain('Задача дня')
  })

  it('opens draft card on add instead of emitting add', async () => {
    const day = new Date(2026, 9, 6)
    const wrapper = mount(DayColumn, {
      props: { day, tasks: [], canDrag: false },
      global: { stubs: { teleport: true } },
    })
    await wrapper.get('[aria-label="Добавить задачу сверху"]').trigger('click')

    expect(wrapper.emitted('add')).toBeUndefined()
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Сохранить"]').exists()).toBe(true)
  })
})
