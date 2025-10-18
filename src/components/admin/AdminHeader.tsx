'use client'

import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import Link from 'next/link'

export function AdminHeader() {
    const { user } = useAuth()

    return (
        <header className="bg-[#1E1E24] border-b border-[#9DA2B3]/25 px-6 py-3">
            <div className="flex items-center justify-between h-full">
                <div className="flex items-center space-x-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Link href="/" className="flex items-center gap-2 bg-white rounded-xl py-2 px-2 cursor-pointer">
                            <Image src="/images/neaply/logo-search.png" alt="Neaply Logo" width={20} height={20} />
                        </Link>
                        <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                            Admin
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Placeholder for future admin controls */}
                </div>
            </div>
        </header>
    )
}
