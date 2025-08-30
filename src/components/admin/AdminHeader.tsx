'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Settings, User, Heart, Store } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminHeader() {
    const { user, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <header className="bg-background border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href={"/"} className="text-2xl font-bold text-foreground font-space-grotesk">Neaply</Link>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        Admin Panel
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/marketplace"
                            className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Marketplace
                        </Link>
                        {user && user.isSeller && (
                            <Link
                                href={`/store/${user.id}`}
                                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                            >
                                <Store className="h-4 w-4" />
                                Your Store
                            </Link>
                        )}
                        {user && (
                            <Link
                                href="/favorites"
                                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                            >
                                <Heart className="h-4 w-4" />
                                Favorites
                            </Link>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.avatar_url || ''} alt={user?.displayName || ''} />
                                    <AvatarFallback>
                                        {user?.displayName?.charAt(0).toUpperCase() || 'A'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/orders')}>
                                <span>Orders History</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/help')}>
                                <span>Help & Support</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
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
