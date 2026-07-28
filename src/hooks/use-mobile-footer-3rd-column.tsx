import * as React from "react"

const MOBILE_BREAKPOINT = 1024

export function useIsMobileFooter3rdColumn() {
  const [isMobileFooter3rdColumn, setIsMobileFooter3rdColumn] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobileFooter3rdColumn(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobileFooter3rdColumn(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobileFooter3rdColumn
}
