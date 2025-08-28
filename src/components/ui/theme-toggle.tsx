'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[140px] bg-transparent border-white/20 text-white hover:bg-white/10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#243238] border-[#3E4E55] text-white">
        <SelectItem value="system" className="text-white hover:bg-white/10 focus:bg-white/10 hover:text-white focus:text-white data-[highlighted]:text-white">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>System</span>
          </div>
        </SelectItem>
        <SelectItem value="light" className="text-white hover:bg-white/10 focus:bg-white/10 hover:text-white focus:text-white data-[highlighted]:text-white">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </div>
        </SelectItem>
        <SelectItem value="dark" className="text-white hover:bg-white/10 focus:bg-white/10 hover:text-white focus:text-white data-[highlighted]:text-white">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
