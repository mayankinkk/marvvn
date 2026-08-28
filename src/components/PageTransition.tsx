'use client'

import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState('in')

  useEffect(() => {
    setTransitionStage('out')
  }, [pathname])

  useEffect(() => {
    if (transitionStage === 'out') {
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setTransitionStage('in')
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [transitionStage, children])

  return (
    <div
      className={`transition-opacity duration-150 ease-in-out ${transitionStage === 'in' ? 'opacity-100' : 'opacity-0'}`}
    >
      {displayChildren}
    </div>
  )
}
