'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    BarChart3,
    Users,
    Package,
    ShoppingCart,
    Flag,
    Bug,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3, description: 'Overview & statistics' },
    { name: 'Users', href: '/admin/users', icon: Users, description: 'Manage users' },
    { name: 'Workflows', href: '/admin/workflows', icon: Package, description: 'Manage workflows' },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, description: 'View orders' },
    { name: 'Reports', href: '/admin/reports', icon: Flag, description: 'View reports' },
    { name: 'Bug Reports', href: '/admin/bug-reports', icon: Bug, description: 'View bug reports' },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-gradient-to-b from-[#1E1E24] to-[#161619] border-r border-[#9DA2B3]/25 h-full flex flex-col overflow-y-auto">
            {/* Navigation Section */}
            <nav className="flex-1 py-8 px-4">
                <div className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-start px-4 py-3 rounded-lg transition-all duration-200 group outline-none font-aeonikpro',
                                    isActive
                                        ? 'bg-blue-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/10'
                                        : 'text-[#9DA2B3] hover:bg-[#40424D]/30  '
                                )}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <Icon
                                            className={cn(
                                                'h-5 w-5 flex-shrink-0 transition-colors',
                                                isActive 
                                                    ? 'text-blue-400' 
                                                    : 'text-[#9DA2B3] group-hover:text-[#EDEFF7]'
                                            )}
                                        />
                                        <span className={cn(
                                            'font-medium text-sm transition-colors',
                                            isActive ? 'text-blue-100 font-semibold' : 'group-hover:text-[#EDEFF7]'
                                        )}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        'text-xs pl-8 transition-colors',
                                        isActive ? 'text-blue-300/70' : 'text-[#9DA2B3]/50 group-hover:text-[#9DA2B3]/70'
                                    )}>
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Divider */}
            <Separator className="mx-4 bg-[#9DA2B3]/15" />

            {/* Footer Section */}
            <div className="p-4 text-center">
                <div className="text-xs text-[#9DA2B3]/60">
                    Neaply Admin
                </div>
                <div className="text-xs text-[#9DA2B3]/40 mt-1">
                    v1.0.0
                </div>
            </div>
        </aside>
    )
}
