export class DateLib {
  public static toIsoDate(value: Date): string {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  public static parseIso(value: string): Date {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  public static mondayOf(value: Date): Date {
    const result = new Date(value.getFullYear(), value.getMonth(), value.getDate())
    const day = result.getDay()
    const diff = day === 0 ? -6 : 1 - day
    result.setDate(result.getDate() + diff)
    return result
  }

  public static addDays(value: Date, days: number): Date {
    const result = new Date(value.getFullYear(), value.getMonth(), value.getDate())
    result.setDate(result.getDate() + days)
    return result
  }

  public static workdaysOfWeek(weekStart: Date): Date[] {
    return [0, 1, 2, 3, 4].map((offset) => DateLib.addDays(weekStart, offset))
  }

  public static isSameDay(left: Date, right: Date): boolean {
    return DateLib.toIsoDate(left) === DateLib.toIsoDate(right)
  }

  public static isOverdue(taskDate: string, isDone: boolean, today = new Date()): boolean {
    if (isDone) return false
    return DateLib.parseIso(taskDate) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }

  public static formatDayMonth(value: Date): string {
    return value.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  }

  public static formatFullDate(value: Date): string {
    return value.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  public static formatWeekRange(weekStart: Date): string {
    const weekEnd = DateLib.addDays(weekStart, 4)
    const start = weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    const end = weekEnd.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    return `${start} — ${end}`
  }

  public static mondayIndex(value: Date): number {
    const day = value.getDay()
    return day === 0 ? 6 : day - 1
  }

  public static daysInMonth(year: number, monthIndex: number): number {
    return new Date(year, monthIndex + 1, 0).getDate()
  }
}
