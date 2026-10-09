export type TImportance = 'low' | 'medium' | 'high'

export type TTask = {
  id: number
  title: string
  description: string
  importance: TImportance
  task_date: string
  deadline: string | null
  is_done: boolean
  position: number
  deleted_at: string | null
  created_at: string
}

export type TTaskCreatePlace = 'top' | 'bottom'

export type TTaskCreate = {
  title: string
  description: string
  importance: TImportance
  task_date: string
  deadline?: string | null
  place?: TTaskCreatePlace
}

export type TWeekGoal = {
  id: number
  week_start: string
  text: string
  is_done: boolean
  created_at: string
}

export type TWeekStats = {
  total: number
  done: number
  not_done: number
  completion_percent: number
}

export type TUser = {
  id: number
  email: string
}
