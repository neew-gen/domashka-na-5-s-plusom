import { DateLib } from '@/libs/classes/date-lib'

describe('DateLib', () => {
  it('toIsoDate and parseIso roundtrip', () => {
    const value = new Date(2026, 9, 6)
    const iso = DateLib.toIsoDate(value)
    expect(iso).toBe('2026-10-06')
    expect(DateLib.toIsoDate(DateLib.parseIso(iso))).toBe(iso)
  })

  it('mondayOf returns monday', () => {
    expect(DateLib.toIsoDate(DateLib.mondayOf(new Date(2026, 9, 9)))).toBe('2026-10-05')
  })

  it('workdaysOfWeek returns five days', () => {
    const days = DateLib.workdaysOfWeek(DateLib.parseIso('2026-10-05'))
    expect(days).toHaveLength(5)
    expect(DateLib.toIsoDate(days[4])).toBe('2026-10-09')
  })

  it('isOverdue ignores done tasks', () => {
    expect(DateLib.isOverdue('2020-01-01', true, new Date(2026, 9, 9))).toBe(false)
    expect(DateLib.isOverdue('2020-01-01', false, new Date(2026, 9, 9))).toBe(true)
  })
})
