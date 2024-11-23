"use client"

import React from 'react'
import { useState,useEffect } from 'react'

const HydrationProvider = ({children}) => {
  const [isHyydrated, setIsHyydrated] = useState(false)
  useEffect(() => {
    setIsHyydrated(true)
  }, [])

  if(!isHyydrated) return null
  return (
    <>
    {children}
    </>
  )
}

export default HydrationProvider