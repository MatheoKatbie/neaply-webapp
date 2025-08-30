'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedTooltipProps {
  children: React.ReactNode
  title: string
  description: string
  show: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function AnimatedTooltip({ children, title, description, show, position = 'bottom' }: AnimatedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000) // Show after 1 second

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show])

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    }
  }

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-black'
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-black'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-black'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-black'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-black'
    }
  }

  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            {/* Tooltip content */}
            <div className="bg-black text-white rounded-lg p-4 shadow-lg min-w-[280px] max-w-sm">
              <div className="font-semibold text-sm mb-2">{title}</div>
              <div className="text-xs text-gray-300 leading-relaxed">{description}</div>

              {/* Arrow */}
              <div className={`absolute w-0 h-0 border-4 border-transparent ${getArrowClasses()}`}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
