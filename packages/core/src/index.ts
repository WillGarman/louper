export interface LoupeOptions {
  /** Default: 2 */
  zoomLevel?: number
  /** Lens radius in px. Default: 150 */
  radius?: number
  /** Default: 3 */
  borderWidth?: number
  /** Default: "white" */
  borderColor?: string
  /** Default: "Alt". Set to false to disable. */
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
  radius: 150,
  borderWidth: 3,
  borderColor: 'white',
  hotkey: 'Alt',
}

const MIN_ZOOM = 1
const MAX_ZOOM = 10
const ZOOM_SENSITIVITY = 0.002
const FADE_OUT = 100

export function createLouper(userOpts: LoupeOptions = {}): LoupeInstance {
  let opts = { ...DEFAULTS, ...userOpts }

  const host = document.createElement('louper-lens')
  const root = host.attachShadow({ mode: 'closed' })
  const styleEl = document.createElement('style')
  styleEl.textContent = css()
  root.appendChild(styleEl)
  const wrapper = document.createElement('div')
  wrapper.className = 'louper-clone-wrapper'
  const content = document.createElement('div')
  content.className = 'louper-clone-container'
  wrapper.appendChild(content)
  root.appendChild(wrapper)
  document.body.appendChild(host)

  let active = false
  let mouseX = 0, mouseY = 0, scrollX = 0, scrollY = 0
  let zoomLevel = opts.zoomLevel
  let rafId: number | null = null
  let pending = false
  let mutationTimer: ReturnType<typeof setTimeout> | null = null

  function css() {
    const d = opts.radius * 2
    return `
      :host {
        position: fixed; top: 0; left: 0;
        z-index: 2147483647;
        pointer-events: none;
        width: ${d}px; height: ${d}px;
        border-radius: 50%;
        border: ${opts.borderWidth}px solid ${opts.borderColor};
        box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        overflow: hidden; opacity: 0;
        transition: opacity ${FADE_OUT}ms ease-out;
        will-change: transform, opacity;
      }
      :host(.louper-active) { opacity: 1; transition: none; }
      .louper-clone-wrapper {
        position: absolute; top: 0; left: 0;
        width: 100%; height: 100%;
        overflow: hidden; border-radius: 50%;
      }
      .louper-clone-container {
        position: absolute; top: 0; left: 0;
        transform-origin: 0 0;
      }
    `
  }

  function render() {
    pending = false
    rafId = null
    const { radius, borderWidth } = opts
    host.style.transform = `translate(${mouseX - radius - borderWidth}px,${mouseY - radius - borderWidth}px)`
    const cx = radius - (mouseX + scrollX) * zoomLevel
    const cy = radius - (mouseY + scrollY) * zoomLevel
    content.style.transform = `scale(${zoomLevel}) translate(${cx / zoomLevel}px,${cy / zoomLevel}px)`
  }

  function scheduleRender() {
    if (!pending) {
      pending = true
      rafId = requestAnimationFrame(render)
    }
  }

  function clonePage() {
    const docEl = document.documentElement
    const copy = docEl.cloneNode(true) as HTMLElement
    copy.querySelectorAll('script').forEach(s => s.remove())
    copy.querySelectorAll('louper-lens').forEach(el => el.remove())

    root.querySelectorAll('[data-louper-sheet]').forEach(el => el.remove())
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.href) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = sheet.href
          link.setAttribute('data-louper-sheet', '')
          root.appendChild(link)
        } else if (sheet.ownerNode instanceof HTMLStyleElement) {
          const s = document.createElement('style')
          s.textContent = sheet.ownerNode.textContent
          s.setAttribute('data-louper-sheet', '')
          root.appendChild(s)
        }
      } catch {} // cross-origin
    }

    const srcCanvases = docEl.querySelectorAll('canvas')
    const dstCanvases = copy.querySelectorAll('canvas')
    srcCanvases.forEach((src, i) => {
      const dst = dstCanvases[i]
      if (!dst) return
      dst.width = src.width
      dst.height = src.height
      const ctx = dst.getContext('2d')
      if (ctx) try { ctx.drawImage(src, 0, 0) } catch {} // tainted
    })

    copy.style.margin = '0'
    copy.style.position = 'absolute'
    copy.style.top = '0'
    copy.style.left = '0'
    copy.style.width = docEl.scrollWidth + 'px'
    copy.style.height = docEl.scrollHeight + 'px'
    content.innerHTML = ''
    content.appendChild(copy)
  }

  const observer = new MutationObserver(() => {
    if (!active) return
    if (mutationTimer) clearTimeout(mutationTimer)
    mutationTimer = setTimeout(() => { if (active) clonePage() }, 16)
  })

  function activate() {
    if (active) return
    active = true
    scrollX = window.scrollX
    scrollY = window.scrollY
    zoomLevel = opts.zoomLevel
    clonePage()
    host.classList.add('louper-active')
    scheduleRender()
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ['class', 'style', 'data-state'],
    })
  }

  function deactivate() {
    if (!active) return
    active = false
    observer.disconnect()
    if (mutationTimer) { clearTimeout(mutationTimer); mutationTimer = null }
    host.classList.remove('louper-active')
    setTimeout(() => { if (!active) content.innerHTML = '' }, FADE_OUT)
  }

  function onKeyDown(e: KeyboardEvent) { if (e.key === opts.hotkey && !active) activate() }
  function onKeyUp(e: KeyboardEvent) { if (e.key === opts.hotkey) deactivate() }
  function onMouseMove(e: MouseEvent) {
    mouseX = e.clientX
    mouseY = e.clientY
    if (active) scheduleRender()
  }
  function onScroll() {
    if (!active) return
    scrollX = window.scrollX
    scrollY = window.scrollY
    scheduleRender()
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
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: false })

  function destroy() {
    active = false
    observer.disconnect()
    if (mutationTimer) clearTimeout(mutationTimer)
    if (rafId !== null) cancelAnimationFrame(rafId)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('blur', deactivate)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('wheel', onWheel)
    host.remove()
  }

  function update(newOpts: Partial<LoupeOptions>) {
    opts = { ...opts, ...newOpts }
    if (newOpts.zoomLevel !== undefined) zoomLevel = newOpts.zoomLevel
    styleEl.textContent = css()
    if (active) scheduleRender()
  }

  return { destroy, update, activate, deactivate }
}
