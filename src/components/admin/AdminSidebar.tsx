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
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Workflows', href: '/admin/workflows', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Reports', href: '/admin/reports', icon: Flag },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-background border-r border-border h-full flex flex-col">
            {/* Navigation Section */}
            <nav className="flex-1 py-6">
                <div className="px-3">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                            isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'mr-3 h-5 w-5 flex-shrink-0',
                                                isActive ? 'text-blue-700 dark:text-blue-300' : 'text-muted-foreground group-hover:text-foreground'
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </nav>

            {/* Footer Section */}
            <div className="p-4 border-t border-border bg-background">
                <div className="text-xs text-muted-foreground text-center">
                    FlowMarket Admin Panel
                </div>
            </div>
        </div>
    )
}
