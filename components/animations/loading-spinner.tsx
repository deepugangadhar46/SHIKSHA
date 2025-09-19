"use client"

import { motion } from "framer-motion"
import { useAccessibility } from "@/contexts/accessibility-context"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingSpinner({ size = "md", text, className = "" }: LoadingSpinnerProps) {
  const { settings } = useAccessibility()

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  if (settings.reducedMotion) {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className={`${sizeClasses[size]} bg-primary rounded-full opacity-60`} />
        {text && <p className={`text-muted-foreground ${textSizes[size]}`}>{text}</p>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
      {text && (
        <motion.p
          className={`text-muted-foreground ${textSizes[size]}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}
