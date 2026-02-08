"use client"

import * as React from "react"

interface LoupeOptions {
  /** Magnification level. Default: 2 */
  zoomLevel?: number
  /** Minimum zoom level when scrolling. Default: 1 */
  minZoom?: number
  /** Maximum zoom level when scrolling. Default: 10 */
  maxZoom?: number
  /** Zoom sensitivity for scroll/pinch. Default: 0.002 */
  zoomSensitivity?: number
  /** Radius of the magnifier circle in pixels. Default: 150 */
  radius?: number
  /** Border width in pixels. Default: 3 */
  borderWidth?: number
  /** Border color. Default: "white" */
  borderColor?: string
  /** Key that activates the loupe. Default: "Alt" */
  hotkey?: "Alt" | "Control" | "Shift" | "Meta"
  /** Fade-out duration in ms. Default: 200 */
  fadeOutDuration?: number
}

interface LoupeProps extends LoupeOptions {
  /**
   * When provided, controls the loupe externally.
   * `true` = loupe visible (hotkey disabled), `false` = hidden.
   * Omit to use hotkey activation (default).
   */
  isOpen?: boolean
}

function Louper({
  isOpen,
  zoomLevel = 2,
  minZoom = 1,
  maxZoom = 10,
  zoomSensitivity = 0.002,
  radius = 150,
  borderWidth = 3,
  borderColor = "white",
  hotkey = "Alt",
  fadeOutDuration = 200,
}: LoupeProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const shadowRef = React.useRef<ShadowRoot | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const cloneContainerRef = React.useRef<HTMLDivElement | null>(null)
  const stateRef = React.useRef({
    active: false,
    mouseX: 0,
    mouseY: 0,
    scrollX: 0,
    scrollY: 0,
  })
  const currentZoomRef = React.useRef(zoomLevel)
  const rafRef = React.useRef<number | null>(null)
  const pendingRef = React.useRef(false)

  const controlled = isOpen !== undefined
  const diameter = radius * 2

  // Initialize shadow DOM once
  React.useEffect(() => {
    const host = hostRef.current
    if (!host || shadowRef.current) return

    const root = host.attachShadow({ mode: "closed" })
    shadowRef.current = root

    const wrapper = document.createElement("div")
    wrapper.className = "louper-clone-wrapper"
    wrapperRef.current = wrapper

    const cloneContainer = document.createElement("div")
    cloneContainer.className = "louper-clone-container"
    cloneContainerRef.current = cloneContainer

    wrapper.appendChild(cloneContainer)
    root.appendChild(wrapper)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Update shadow styles when options change
  React.useEffect(() => {
    const root = shadowRef.current
    if (!root) return

    let styleEl = root.querySelector("style[data-louper]") as HTMLStyleElement
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.setAttribute("data-louper", "")
      root.insertBefore(styleEl, root.firstChild)
    }

    styleEl.textContent = `
      .louper-clone-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 50%;
      }
      .louper-clone-container {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        will-change: transform;
      }
    `
  }, [radius, borderWidth, borderColor, zoomLevel, fadeOutDuration])

  // Clone document into shadow DOM
  const cloneDocument = React.useCallback(() => {
    const root = shadowRef.current
    const cloneContainer = cloneContainerRef.current
    if (!root || !cloneContainer) return

    const docEl = document.documentElement
    const clone = docEl.cloneNode(true) as HTMLElement

    clone.querySelectorAll("script").forEach((s) => s.remove())
    clone.querySelectorAll("[data-louper-host]").forEach((el) => el.remove())

    // Copy stylesheets
    root.querySelectorAll("[data-louper-sheet]").forEach((el) => el.remove())
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.href) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = sheet.href
          link.setAttribute("data-louper-sheet", "")
          root.appendChild(link)
        } else if (sheet.ownerNode instanceof HTMLStyleElement) {
          const style = document.createElement("style")
          style.textContent = sheet.ownerNode.textContent
          style.setAttribute("data-louper-sheet", "")
          root.appendChild(style)
        }
      } catch {
        // Cross-origin stylesheet
      }
    }

    // Copy canvas data
    const srcCanvases = docEl.querySelectorAll("canvas")
    const cloneCanvases = clone.querySelectorAll("canvas")
    srcCanvases.forEach((src, i) => {
      const dest = cloneCanvases[i]
      if (!dest) return
      dest.width = src.width
      dest.height = src.height
      const ctx = dest.getContext("2d")
      if (ctx) {
        try {
          ctx.drawImage(src, 0, 0)
        } catch {
          // Tainted canvas
        }
      }
    })

    clone.style.margin = "0"
    clone.style.position = "absolute"
    clone.style.top = "0"
    clone.style.left = "0"
    clone.style.width = docEl.scrollWidth + "px"
    clone.style.height = docEl.scrollHeight + "px"

    cloneContainer.innerHTML = ""
    cloneContainer.appendChild(clone)
  }, [])

  // Render position
  const scheduleRender = React.useCallback(() => {
    if (pendingRef.current) return
    pendingRef.current = true
    rafRef.current = requestAnimationFrame(() => {
      pendingRef.current = false
      rafRef.current = null

      const host = hostRef.current
      const cloneContainer = cloneContainerRef.current
      if (!host || !cloneContainer) return

      const { mouseX, mouseY, scrollX, scrollY } = stateRef.current
      const zoom = currentZoomRef.current

      const hostX = mouseX - radius - borderWidth
      const hostY = mouseY - radius - borderWidth
      host.style.transform = `translate(${hostX}px, ${hostY}px)`

      const docX = mouseX + scrollX
      const docY = mouseY + scrollY
      const cloneX = radius - docX * zoom
      const cloneY = radius - docY * zoom
      cloneContainer.style.transform = `scale(${zoom}) translate(${cloneX / zoom}px, ${cloneY / zoom}px)`
    })
  }, [radius, borderWidth])

  // Activate / deactivate
  const activate = React.useCallback(() => {
    stateRef.current.active = true
    stateRef.current.scrollX = window.scrollX
    stateRef.current.scrollY = window.scrollY
    currentZoomRef.current = zoomLevel
    cloneDocument()
    hostRef.current?.classList.add("louper-active")
    scheduleRender()
  }, [cloneDocument, scheduleRender, zoomLevel])

  const deactivate = React.useCallback(() => {
    stateRef.current.active = false
    hostRef.current?.classList.remove("louper-active")
    setTimeout(() => {
      if (!stateRef.current.active && cloneContainerRef.current) {
        cloneContainerRef.current.innerHTML = ""
      }
    }, fadeOutDuration)
  }, [fadeOutDuration])

  // Controlled mode
  React.useEffect(() => {
    if (!controlled) return
    if (isOpen) {
      activate()
    } else {
      deactivate()
    }
  }, [isOpen, controlled, activate, deactivate])

  // Event listeners (hotkey mode)
  React.useEffect(() => {
    if (controlled) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === hotkey && !stateRef.current.active) {
        activate()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === hotkey && stateRef.current.active) {
        deactivate()
      }
    }
    const onBlur = () => {
      if (stateRef.current.active) deactivate()
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", onBlur)
    }
  }, [controlled, hotkey, activate, deactivate])

  // Mouse + scroll + wheel tracking (always active)
  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      stateRef.current.mouseX = e.clientX
      stateRef.current.mouseY = e.clientY
      if (stateRef.current.active) scheduleRender()
    }
    const onScroll = () => {
      if (stateRef.current.active) {
        stateRef.current.scrollX = window.scrollX
        stateRef.current.scrollY = window.scrollY
        scheduleRender()
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (stateRef.current.active) {
        e.preventDefault()
        const current = currentZoomRef.current
        currentZoomRef.current = Math.min(
          maxZoom,
          Math.max(minZoom, current * (1 - e.deltaY * zoomSensitivity)),
        )
        scheduleRender()
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("wheel", onWheel)
    }
  }, [scheduleRender, minZoom, maxZoom, zoomSensitivity])

  return (
    <div
      ref={hostRef}
      data-louper-host=""
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 2147483647,
        pointerEvents: "none",
        width: diameter,
        height: diameter,
        borderRadius: "50%",
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)",
        overflow: "hidden",
        opacity: 0,
        transition: `opacity ${fadeOutDuration}ms ease-out`,
        willChange: "transform, opacity",
      }}
    />
  )
}

// Add the active styles via a global style tag
if (typeof document !== "undefined") {
  const id = "louper-global-styles"
  if (!document.getElementById(id)) {
    const style = document.createElement("style")
    style.id = id
    style.textContent = `[data-louper-host].louper-active { opacity: 1 !important; transition: none !important; }`
    document.head.appendChild(style)
  }
}

export { Louper }
export type { LoupeProps, LoupeOptions }
