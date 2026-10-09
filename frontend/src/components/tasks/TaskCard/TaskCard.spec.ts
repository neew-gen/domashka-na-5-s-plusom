import { mount } from '@vue/test-utils'

import TaskCard from '@/components/tasks/TaskCard/TaskCard.vue'
import type { TTask } from '@/libs/types/task.type'

const makeTask = (overrides: Partial<TTask> = {}): TTask => ({
  id: 1,
  title: 'Отчёт',
  description: 'Сделать отчёт',
  importance: 'high',
  task_date: '2026-10-06',
  deadline: null,
  is_done: false,
  position: 0,
  deleted_at: null,
  created_at: '2026-10-06T10:00:00Z',
  ...overrides,
})

describe('TaskCard', () => {
  it('renders description and updates when props change', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: makeTask() },
      global: { stubs: { teleport: true } },
    })
    expect(wrapper.text()).toContain('Отчёт')
    expect(wrapper.text()).toContain('Сделать отчёт')
    expect(wrapper.find('.task-card__actions--desktop [aria-label="Выполнено"]').exists()).toBe(true)

    await wrapper.setProps({ task: makeTask({ is_done: true }) })
    expect(wrapper.find('.task-card__actions--desktop [aria-label="Вернуть"]').exists()).toBe(true)
    expect(wrapper.find('p').classes()).toContain('line-through')
    expect(wrapper.find('p').classes()).toContain('text-success')
  })

  it('emits toggle', async () => {
    const task = makeTask()
    const wrapper = mount(TaskCard, {
      props: { task },
      global: { stubs: { teleport: true } },
    })
    await wrapper.get('.task-card__actions--desktop [aria-label="Выполнено"]').trigger('click')
    expect(wrapper.emitted('toggle')?.[0]).toEqual([task])
  })

  it('opens inline form on double click and emits save', async () => {
    const task = makeTask()
    const wrapper = mount(TaskCard, {
      props: { task },
      global: { stubs: { teleport: true } },
    })

    await wrapper.get('.task-card').trigger('dblclick')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[placeholder="Название"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Редактировать"]').exists()).toBe(false)

    await wrapper.get('input[placeholder="Название"]').setValue('Новое название')
    await wrapper.get('textarea').setValue('Новое описание')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('save')?.[0]).toEqual([
      task,
      {
        title: 'Новое название',
        description: 'Новое описание',
        importance: 'high',
        deadline: null,
      },
    ])
  })

  it('exits edit mode when pointer is pressed outside the card', async () => {
    const wrapper = mount(TaskCard, {
      props: { task: makeTask() },
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })

    await wrapper.get('.task-card').trigger('dblclick')
    expect(wrapper.find('form').exists()).toBe(true)

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new Event('pointerup', { bubbles: true }))
    await Promise.resolve()

    expect(wrapper.find('form').exists()).toBe(false)
    wrapper.unmount()
  })
})
