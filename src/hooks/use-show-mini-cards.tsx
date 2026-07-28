import * as React from "react"

const MOBILE_BREAKPOINT = 1600

export function useShowMiniCards() {
  const [showMiniCards, setShowMiniCards] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setShowMiniCards(window.innerWidth >= MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)
    setShowMiniCards(window.innerWidth >= MOBILE_BREAKPOINT)

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!showMiniCards
}
