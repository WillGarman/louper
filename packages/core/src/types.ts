export interface LoupeOptions {
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
  hotkey?: 'Alt' | 'Control' | 'Shift' | 'Meta'
  /** Fade-out duration in ms. Default: 200 */
  fadeOutDuration?: number
}

export interface LoupeInstance {
  /** Remove all listeners and DOM elements */
  destroy: () => void
  /** Update options at runtime */
  update: (options: Partial<LoupeOptions>) => void
}

export interface LoupeState {
  active: boolean
  mouseX: number
  mouseY: number
  scrollX: number
  scrollY: number
}

export const DEFAULTS: Required<LoupeOptions> = {
  zoomLevel: 2,
  minZoom: 1,
  maxZoom: 10,
  zoomSensitivity: 0.002,
  radius: 150,
  borderWidth: 3,
  borderColor: 'white',
  hotkey: 'Alt',
  fadeOutDuration: 200,
}
