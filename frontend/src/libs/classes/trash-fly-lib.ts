import { TRASH_FLY_MS } from '@/libs/constants/trash-fly.constant'

const TARGET_ATTR = 'data-trash-fly-target'

const TRASH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
  <path d="M3 6h18" />
  <path d="M8 6V4h8v2" />
  <path d="M19 6l-1 14H6L5 6" />
  <path d="M10 11v6" />
  <path d="M14 11v6" />
</svg>
`

let targetEl: HTMLElement | null = null

export const registerTrashFlyTarget = (el: HTMLElement | null) => {
  targetEl = el
}

const resolveTarget = () => {
  if (targetEl?.isConnected) return targetEl
  return document.querySelector<HTMLElement>(`[${TARGET_ATTR}]`)
}

export const spawnTrashFly = (fromEl: HTMLElement) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const toEl = resolveTarget()
  if (!toEl) return

  const from = fromEl.getBoundingClientRect()
  const to = toEl.getBoundingClientRect()
  const size = Math.max(from.width, 28)

  const ghost = document.createElement('div')
  ghost.setAttribute('aria-hidden', 'true')
  ghost.innerHTML = TRASH_SVG
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-accent)',
    zIndex: '2147483646',
    pointerEvents: 'none',
    margin: '0',
    padding: '0',
  })
  document.body.appendChild(ghost)

  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)

  const animation = ghost.animate(
    [
      {
        transform: 'translate(0, 0) scale(1) rotate(0deg)',
        opacity: 1,
      },
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 28}px) scale(0.95) rotate(-16deg)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.35) rotate(-8deg)`,
        opacity: 0,
      },
    ],
    {
      duration: TRASH_FLY_MS,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    },
  )

  toEl.classList.add('trash-fly-target--catch')
  window.setTimeout(() => {
    toEl.classList.remove('trash-fly-target--catch')
  }, TRASH_FLY_MS)

  animation.finished.finally(() => {
    ghost.remove()
  })
}
