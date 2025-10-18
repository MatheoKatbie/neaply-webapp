'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function AdminHeader() {
    const { user, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <header className="bg-[#1E1E24] border-b border-[#9DA2B3]/25 px-6 py-3">
            <div className="flex items-center justify-between h-full">
                <div className="flex items-center space-x-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Image 
                            src="/images/neaply/logo-search.png" 
                            alt="Neaply" 
                            width={32} 
                            height={32}
                            className="h-8 w-auto"
                        />
                        <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                            Admin
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-[#40424D]/50">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={user?.avatar_url || ''} alt={user?.displayName || ''} />
                                    <AvatarFallback className="bg-blue-500/20 text-blue-300">
                                        {user?.displayName?.charAt(0).toUpperCase() || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium font-aeonikpro leading-none">{user?.displayName}</p>
                                    <p className="text-xs leading-none text-[#9DA2B3]">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
