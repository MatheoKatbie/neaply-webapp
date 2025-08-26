'use client'

import type { Workflow } from '@/types/workflow'
import { Bot, Clock, Database, Globe, Shield, TrendingUp, Workflow as WorkflowIcon, Zap } from 'lucide-react'
import React, { useEffect, useMemo, useRef } from 'react'

interface AutoThumbnailProps {
  workflow: Pick<Workflow, 'id' | 'title' | 'shortDesc' | 'categories' | 'tags'> & {
    longDescMd?: string
    platform?: string
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const ICONS = {
  default: Zap,
  workflow: WorkflowIcon,
  database: Database,
  ai: Bot,
  webhook: Globe,
  security: Shield,
  automation: Clock,
  analytics: TrendingUp,
}

const COLOR_PALETTES = [
  // Modern gradients
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a8edea', '#fed6e3'],
  ['#ffecd2', '#fcb69f'],
  ['#ff9a9e', '#fecfef'],
  ['#a18cd1', '#fbc2eb'],
  ['#fad0c4', '#ffd1ff'],
  // Tech-inspired gradients
  ['#2c3e50', '#3498db'],
  ['#8e44ad', '#9b59b6'],
  ['#e74c3c', '#c0392b'],
  ['#27ae60', '#2ecc71'],
  ['#f39c12', '#e67e22'],
  ['#1abc9c', '#16a085'],
  ['#34495e', '#2c3e50'],
  ['#e67e22', '#d35400'],
]

export function AutoThumbnail({ workflow, className = '', size = 'md' }: AutoThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  // Generate deterministic values based on workflow data
  const { colors, icon, patterns, complexity } = useMemo(() => {
    const hash = workflow.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    const titleHash = workflow.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
    const descHash = (workflow.shortDesc || '')
      .split('')
      .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)

    // Select color palette
    const paletteIndex = hash % COLOR_PALETTES.length
    const colors = COLOR_PALETTES[paletteIndex]

    // Select icon based on content
    let iconKey = 'default'
    const content = `${workflow.title} ${workflow.shortDesc} ${workflow.platform || ''}`.toLowerCase()

    if (content.includes('database') || content.includes('sql') || content.includes('data')) {
      iconKey = 'database'
    } else if (content.includes('ai') || content.includes('ml') || content.includes('gpt')) {
      iconKey = 'ai'
    } else if (content.includes('webhook') || content.includes('api')) {
      iconKey = 'webhook'
    } else if (content.includes('security') || content.includes('auth')) {
      iconKey = 'security'
    } else if (content.includes('analytics') || content.includes('report')) {
      iconKey = 'analytics'
    } else if (content.includes('automation') || content.includes('schedule')) {
      iconKey = 'automation'
    }

    // Determine complexity based on description length and categories
    const complexity = Math.min(
      Math.max(
        ((workflow.shortDesc?.length || 0) + (workflow.longDescMd?.length || 0)) / 50 +
        (workflow.categories?.length || 0) * 0.3,
        0.3
      ),
      1
    )

    // Generate pattern type
    const patterns = (titleHash + descHash) % 3 // 0: geometric, 1: organic, 2: tech

    return {
      colors,
      icon: ICONS[iconKey as keyof typeof ICONS],
      patterns,
      complexity,
    }
  }, [workflow])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    const width = rect.width
    const height = rect.height
    const time = Date.now() * 0.001

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[1])

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add subtle noise pattern
    ctx.globalAlpha = 0.1
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 3 + 1

      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    // Draw geometric patterns based on type
    if (patterns === 0) {
      // Geometric patterns
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1

      // Grid pattern
      const gridSize = 20
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Diagonal lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      for (let i = 0; i < 5; i++) {
        const offset = (time * 20 + i * 50) % (width + height)
        ctx.beginPath()
        ctx.moveTo(offset, 0)
        ctx.lineTo(offset - height, height)
        ctx.stroke()
      }
    } else if (patterns === 1) {
      // Organic patterns (circles and curves)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'

      for (let i = 0; i < 8; i++) {
        const x = (Math.sin(time * 0.5 + i) * 0.3 + 0.5) * width
        const y = (Math.cos(time * 0.3 + i) * 0.3 + 0.5) * height
        const radius = Math.sin(time + i) * 10 + 30

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      // Tech patterns (circuit-like)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.lineWidth = 2

      // Circuit paths
      for (let i = 0; i < 6; i++) {
        const startX = Math.random() * width
        const startY = Math.random() * height

        ctx.beginPath()
        ctx.moveTo(startX, startY)

        let x = startX
        let y = startY

        for (let j = 0; j < 4; j++) {
          if (Math.random() > 0.5) {
            x += Math.random() * 100 - 50
          } else {
            y += Math.random() * 100 - 50
          }
          ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }

    // Add floating particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    for (let i = 0; i < 15; i++) {
      const x = (Math.sin(time * 0.5 + i * 0.5) * 0.4 + 0.5) * width
      const y = (Math.cos(time * 0.3 + i * 0.7) * 0.4 + 0.5) * height
      const size = Math.sin(time + i) * 2 + 3

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add complexity-based overlay
    if (complexity > 0.5) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, width, height)
    }

    // Draw central icon background
    const iconSize = Math.min(width, height) * 0.2
    const iconX = width / 2
    const iconY = height / 2

    // Icon background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.beginPath()
    ctx.arc(iconX, iconY, iconSize * 0.8, 0, Math.PI * 2)
    ctx.fill()

    // Icon border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(iconX, iconY, iconSize * 0.8, 0, Math.PI * 2)
    ctx.stroke()

    // Animate
    animationRef.current = requestAnimationFrame(() => {
      // Re-render on next frame for subtle animation
    })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [colors, icon, patterns, complexity])

  const sizeClasses = {
    sm: 'h-24 w-full',
    md: 'h-48 w-full',
    lg: 'h-64 w-full',
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${sizeClasses[size]} ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />

      {/* Icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
          {React.createElement(icon, { className: 'w-8 h-8 text-primary-foreground' })}
        </div>
      </div>

      {/* Subtle overlay for better text contrast */}
      <div className="absolute inset-0 bg-primary/5" />
    </div>
  )
}
