export interface LoupeOptions {
  zoomLevel?: number
  radius?: number
  borderWidth?: number
  borderColor?: string
  hotkey?: 'Alt' | 'Control' | 'Shift' | 'Meta' | false
}

export interface LoupeInstance {
  destroy: () => void
  update: (opts: Partial<LoupeOptions>) => void
  activate: () => void
  deactivate: () => void
}

export const DEFAULTS: Required<LoupeOptions> = {
  zoomLevel: 2,
  radius: 80,
  borderWidth: 3,
  borderColor: 'white',
  hotkey: 'Alt',
}

const MIN_ZOOM = 1
const MAX_ZOOM = 10
const ZOOM_SENSITIVITY = 0.002
const FADE_OUT = 100

export function louper(userOpts: LoupeOptions = {}): LoupeInstance {
  let opts = { ...DEFAULTS, ...userOpts }

  const host = document.createElement('louper-lens')
  const shadow = host.attachShadow({ mode: 'closed' })

  const hostStyle = document.createElement('style')
  hostStyle.textContent = `
    :host {
      position: fixed; z-index: 2147483647;
      pointer-events: none; border-radius: 50%;
      overflow: hidden; box-sizing: border-box;
      opacity: 0; transition: opacity ${FADE_OUT}ms ease-out;
    }
    :host(.louper-active) { opacity: 1; transition: none; }
    #lens { position: absolute; }
  `
  shadow.appendChild(hostStyle)

  const lens = document.createElement('div')
  lens.id = 'lens'
  shadow.appendChild(lens)
  document.body.appendChild(host)

  let active = false
  let mouseX = 0, mouseY = 0
  let zoomLevel = opts.zoomLevel
  let rafId: number | null = null
  let pending = false
  let observer: MutationObserver | null = null
  let debounceId: ReturnType<typeof setTimeout> | null = null
  let cloneBody: HTMLElement | null = null

  function readStyles(): string {
    let css = '* { animation:none!important; transition:none!important; }\n'
    css += 'louper-lens { display:none!important; }\n'
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) css += rule.cssText + '\n'
      } catch {
        const href = (sheet as CSSStyleSheet).href
        if (href) css += `@import url("${href}");\n`
      }
    }
    return css
  }

  // Walk from el up to body recording child indices, then walk same path in clone
  function findInClone(el: Element): Element | null {
    if (!cloneBody) return null
    const path: number[] = []
    let cur: Element | null = el
    while (cur && cur !== document.body) {
      const parent: Element | null = cur.parentElement
      if (!parent) return null
      path.push(Array.from(parent.children).indexOf(cur))
      cur = parent
    }
    if (cur !== document.body) return null
    let node: Element = cloneBody
    for (let i = path.length - 1; i >= 0; i--) {
      const child = node.children[path[i]]
      if (!child) return null
      node = child
    }
    return node
  }

  function syncAllScroll() {
    if (!cloneBody) return
    const els = document.body.querySelectorAll('*')
    for (let i = 0; i < els.length; i++) {
      const el = els[i] as HTMLElement
      if (el.scrollTop || el.scrollLeft) {
        const c = findInClone(el) as HTMLElement
        if (c) {
          c.scrollTop = el.scrollTop
          c.scrollLeft = el.scrollLeft
        }
      }
    }
  }

  function clonePage() {
    // Don't remove elements from clone — preserves structure for findInClone
    const clone = document.body.cloneNode(true) as HTMLElement
    lens.innerHTML = ''
    const s = document.createElement('style')
    s.textContent = readStyles()
    lens.appendChild(s)
    lens.appendChild(clone)
    cloneBody = clone
    requestAnimationFrame(syncAllScroll)
  }

  function onScroll(e: Event) {
    if (!active || !cloneBody) return
    const target = e.target as Element
    if (!target || target === (document as any) || target === document.documentElement) return
    const c = findInClone(target) as HTMLElement
    if (c) {
      c.scrollTop = target.scrollTop
      c.scrollLeft = target.scrollLeft
    }
  }

  function scheduleClone() {
    if (debounceId) clearTimeout(debounceId)
    debounceId = setTimeout(() => { if (active) clonePage() }, 200)
  }

  function render() {
    pending = false
    rafId = null
    const { radius, borderWidth, borderColor } = opts
    const sx = window.scrollX, sy = window.scrollY

    host.style.left = `${mouseX - radius}px`
    host.style.top = `${mouseY - radius}px`
    host.style.width = `${radius * 2}px`
    host.style.height = `${radius * 2}px`
    host.style.border = `${borderWidth}px solid ${borderColor}`
    host.style.boxShadow = '0 2px 12px rgba(0,0,0,.15), 0 0 0 1px rgba(0,0,0,.1)'

    const bx = mouseX + sx, by = mouseY + sy
    lens.style.left = `${radius - bx * zoomLevel}px`
    lens.style.top = `${radius - by * zoomLevel}px`
    lens.style.width = `${document.documentElement.scrollWidth}px`
    lens.style.height = `${document.documentElement.scrollHeight}px`
    lens.style.transform = `scale(${zoomLevel})`
    lens.style.transformOrigin = `0 0`
  }

  function scheduleRender() {
    if (!pending) { pending = true; rafId = requestAnimationFrame(render) }
  }

  function activate() {
    if (active) return
    active = true
    zoomLevel = opts.zoomLevel
    clonePage()
    host.classList.add('louper-active')
    scheduleRender()
    observer = new MutationObserver((muts) => {
      if (muts.every(m => m.target === host)) return
      scheduleClone()
    })
    observer.observe(document.body, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['class', 'style'],
    })
    document.addEventListener('scroll', onScroll, true)
  }

  function deactivate() {
    if (!active) return
    active = false
    host.classList.remove('louper-active')
    observer?.disconnect()
    observer = null
    if (debounceId) { clearTimeout(debounceId); debounceId = null }
    document.removeEventListener('scroll', onScroll, true)
    cloneBody = null
  }

  function onKeyDown(e: KeyboardEvent) { if (e.key === opts.hotkey && !active) activate() }
  function onKeyUp(e: KeyboardEvent) { if (e.key === opts.hotkey) deactivate() }
  function onMouseMove(e: MouseEvent) {
    mouseX = e.clientX; mouseY = e.clientY
    if (active) scheduleRender()
  }
  function onWheel(e: WheelEvent) {
    if (!active) return
    e.preventDefault()
    zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel * (1 - e.deltaY * ZOOM_SENSITIVITY)))
    scheduleRender()
  }

  if (opts.hotkey) {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', deactivate)
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('wheel', onWheel, { passive: false })

  function destroy() {
    deactivate()
    if (rafId !== null) cancelAnimationFrame(rafId)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('blur', deactivate)
    window.removeEventListener('wheel', onWheel)
    host.remove()
  }

  function update(newOpts: Partial<LoupeOptions>) {
    opts = { ...opts, ...newOpts }
    if (newOpts.zoomLevel !== undefined) zoomLevel = newOpts.zoomLevel
    if (active) scheduleRender()
  }

  return { destroy, update, activate, deactivate }
}
