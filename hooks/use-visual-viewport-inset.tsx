import * as React from "react"

export type VisualViewportInset = {
  /** Distance from the layout viewport's bottom to the visible area's bottom (keyboard + Safari panning). */
  bottom: number
  /** Height of the visible area. */
  height: number
}

/**
 * Tracks the part of the screen that is actually visible (window.visualViewport).
 * On iOS Safari the keyboard shrinks the visual viewport and Safari may also pan it
 * (offsetTop), while position: fixed elements stay anchored to the layout viewport.
 * Listening to both resize and scroll lets fixed UI stay pinned to what the user sees.
 */
export function useVisualViewportInset(enabled: boolean) {
  const [inset, setInset] = React.useState<VisualViewportInset | null>(null)

  React.useEffect(() => {
    const vv = window.visualViewport
    if (!enabled || !vv) {
      setInset(null)
      return
    }
    const update = () => {
      setInset({
        bottom: Math.max(0, window.innerHeight - (vv.offsetTop + vv.height)),
        height: vv.height,
      })
    }
    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [enabled])

  return inset
}
