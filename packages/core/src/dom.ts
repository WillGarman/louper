import type { ShadowContainer } from './shadow'

export function cloneDocument(container: ShadowContainer): void {
  const docEl = document.documentElement
  const clone = docEl.cloneNode(true) as HTMLElement

  // Remove all scripts from clone
  clone.querySelectorAll('script').forEach((s) => s.remove())

  // Remove louper's own host element from clone to prevent recursion
  clone.querySelectorAll('louper-lens').forEach((el) => el.remove())

  // Copy stylesheets into shadow DOM so the clone renders correctly
  copyStylesheets(container)

  // Copy canvas pixel data
  copyCanvasData(docEl, clone)

  // Set clone dimensions to match document
  clone.style.margin = '0'
  clone.style.position = 'absolute'
  clone.style.top = '0'
  clone.style.left = '0'
  clone.style.width = docEl.scrollWidth + 'px'
  clone.style.height = docEl.scrollHeight + 'px'

  container.cloneContainer.innerHTML = ''
  container.cloneContainer.appendChild(clone)
}

function copyStylesheets(container: ShadowContainer): void {
  // Remove previously copied stylesheets
  container.root.querySelectorAll('[data-louper-sheet]').forEach((el) => el.remove())

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      if (sheet.href) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        link.setAttribute('data-louper-sheet', '')
        container.root.appendChild(link)
      } else if (sheet.ownerNode instanceof HTMLStyleElement) {
        const style = document.createElement('style')
        style.textContent = sheet.ownerNode.textContent
        style.setAttribute('data-louper-sheet', '')
        container.root.appendChild(style)
      }
    } catch {
      // Cross-origin stylesheets may throw - skip them
    }
  }
}

function copyCanvasData(source: HTMLElement, clone: HTMLElement): void {
  const sourceCanvases = source.querySelectorAll('canvas')
  const cloneCanvases = clone.querySelectorAll('canvas')

  sourceCanvases.forEach((srcCanvas, i) => {
    const destCanvas = cloneCanvases[i]
    if (!destCanvas) return

    destCanvas.width = srcCanvas.width
    destCanvas.height = srcCanvas.height

    const ctx = destCanvas.getContext('2d')
    if (ctx) {
      try {
        ctx.drawImage(srcCanvas, 0, 0)
      } catch {
        // Tainted canvas - skip
      }
    }
  })
}

export function computeCloneTransform(
  mouseX: number,
  mouseY: number,
  scrollX: number,
  scrollY: number,
  zoomLevel: number,
  radius: number,
): { cloneX: number; cloneY: number } {
  // The document coordinate the mouse is over
  const docX = mouseX + scrollX
  const docY = mouseY + scrollY

  // Offset so the cursor's document position maps to the center of the circle
  const cloneX = radius - docX * zoomLevel
  const cloneY = radius - docY * zoomLevel

  return { cloneX, cloneY }
}
