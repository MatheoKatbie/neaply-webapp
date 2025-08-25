'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!user || !user.isAdmin)) {
            router.push('/')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    if (!user || !user.isAdmin) {
        return null // Will redirect to home
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
                <AdminHeader />
            </div>

            {/* Main Layout with Sidebar and Content */}
            <div className="flex flex-1 pt-16"> {/* pt-16 to account for fixed header */}
                {/* Fixed Sidebar - full height minus header */}
                <div className="fixed left-0 top-16 bottom-0 z-40">
                    <AdminSidebar />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 ml-64 p-6 mb-4 pb-0"> {/* ml-64 to account for sidebar width, pb-0 to remove bottom padding */}
                    {children}
                </main>
            </div>
        </div>
    )
}
