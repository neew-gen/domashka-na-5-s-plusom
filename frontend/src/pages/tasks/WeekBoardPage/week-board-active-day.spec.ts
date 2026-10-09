import { DateLib } from '@/libs/classes/date-lib'

const resolveActiveDayIso = (args: {
  workdays: Date[]
  selectedDayIso: string | null
  today: Date
}) => {
  const days = args.workdays.map((day) => DateLib.toIsoDate(day))
  if (!days.length) return ''
  if (args.selectedDayIso && days.includes(args.selectedDayIso)) {
    return args.selectedDayIso
  }
  const today = DateLib.toIsoDate(args.today)
  if (days.includes(today)) return today
  return days[0]
}

const dayColumnFingerprint = (
  tasks: Array<{
    id: number
    title: string
    description: string
    importance: string
    deadline: string | null
    position: number
  }>,
) =>
  tasks
    .map(
      (item) =>
        `${item.id}:${item.title}:${item.description}:${item.importance}:${item.deadline ?? ''}:${item.position}`,
    )
    .join('|')

describe('WeekBoard active day and column key', () => {
  it('falls back to first workday when today is outside week', () => {
    const workdays = DateLib.workdaysOfWeek(DateLib.parseIso('2026-09-28'))
    const iso = resolveActiveDayIso({
      workdays,
      selectedDayIso: null,
      today: new Date(2026, 9, 9),
    })
    expect(iso).toBe('2026-09-28')
  })

  it('keeps selected day when it remains in week', () => {
    const workdays = DateLib.workdaysOfWeek(DateLib.parseIso('2026-10-05'))
    const iso = resolveActiveDayIso({
      workdays,
      selectedDayIso: '2026-10-08',
      today: new Date(2026, 9, 9),
    })
    expect(iso).toBe('2026-10-08')
  })

  it('keeps fingerprint when only is_done would change', () => {
    const before = dayColumnFingerprint([
      {
        id: 1,
        title: 'A',
        description: 'Desc',
        importance: 'medium',
        deadline: null,
        position: 0,
      },
    ])
    const after = dayColumnFingerprint([
      {
        id: 1,
        title: 'A',
        description: 'Desc',
        importance: 'medium',
        deadline: null,
        position: 0,
      },
    ])
    expect(before).toBe(after)
  })
})
