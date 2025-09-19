"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useAccessibility } from "@/contexts/accessibility-context"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  const { settings } = useAccessibility()

  const variants = {
    initial: settings.reducedMotion ? {} : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: settings.reducedMotion ? {} : { opacity: 0, y: -20 },
  }

  const transition = settings.reducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
