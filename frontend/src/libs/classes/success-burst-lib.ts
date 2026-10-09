import { ref } from 'vue'

import { SUCCESS_BURST_MS } from '@/libs/constants/success-burst.constant'

export type TSuccessBurst = {
  id: number
  x: number
  y: number
}

let seq = 0

export const successBursts = ref<TSuccessBurst[]>([])

export const spawnSuccessBurst = (x: number, y: number) => {
  const id = ++seq
  successBursts.value = [...successBursts.value, { id, x, y }]
  window.setTimeout(() => {
    successBursts.value = successBursts.value.filter((item) => item.id !== id)
  }, SUCCESS_BURST_MS)
}
