'use client'

import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'
import { UserDetailsModal } from '@/components/admin/UserDetailsModal'
import { UserEditModal } from '@/components/admin/UserEditModal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Crown, Eye, Shield, ShieldX, Store, User, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface User {
    id: string
    displayName: string
    email: string
    avatarUrl?: string | null
    isAdmin: boolean
    isSeller: boolean
    createdAt: Date
    sellerProfile?: {
        storeName?: string
        bio?: string
        websiteUrl?: string
        phoneNumber?: string
        countryCode?: string
        status?: string
    } | null
    _count: {
        workflows: number
        orders: number
        reviews: number
    }
}

interface AdminUsersProps {
    users: User[]
    totalCount: number
    totalPages: number
    currentPage: number
}

export default function AdminUsers({ users, totalCount, totalPages, currentPage }: AdminUsersProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date))
    }

    const handleViewDetails = (user: User) => {
        setSelectedUser(user)
        setIsDetailsModalOpen(true)
    }

    const handleEditUser = (userId: string) => {
        setIsDetailsModalOpen(false)
        setIsEditModalOpen(true)
    }

    const handleSaveUser = async (userId: string, data: any) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to update user')
            }

            toast.success('User updated successfully')
            setIsEditModalOpen(false)
            // Refresh the page to show updated data
            window.location.reload()
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Failed to update user')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete user')
            }

            toast.success('User deleted successfully')
            // Refresh the page to show updated data
            window.location.reload()
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user')
        }
    }

    const filterOptions = [
        {
            key: 'role',
            label: 'Role',
            options: [
                { value: 'admin', label: 'Admin' },
                { value: 'seller', label: 'Creator' },
                { value: 'user', label: 'User' }
            ]
        },
        {
            key: 'sellerStatus',
            label: 'Creator Status',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'pending', label: 'Pending' }
            ]
        }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-[#EDEFF7] font-space-grotesk mb-2">Users Management</h1>
                <p className="text-[#9DA2B3] text-lg">Manage user accounts and permissions</p>
            </div>

            <AdminSearchFilters
                searchPlaceholder="Search users by name or email..."
                filters={filterOptions}
                dateRangeFilter={true}
            />

            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-2xl">
                        <Users className="h-6 w-6 text-blue-400" />
                        <span>All Users ({totalCount})</span>
                    </CardTitle>
                    <CardDescription className="text-[#9DA2B3]/70 text-base">
                        View and manage user accounts, roles, and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 border border-[#9DA2B3]/20 rounded-lg hover:border-[#9DA2B3]/40 hover:bg-[#40424D]/20 transition-all duration-200"
                            >
                                <div className="flex items-center space-x-4 flex-1">
                                    <Avatar className="h-10 w-10 border border-[#9DA2B3]/30">
                                        <AvatarImage src={user.avatarUrl || ''} alt={user.displayName} />
                                        <AvatarFallback className="bg-blue-500/20 text-blue-300">
                                            {user.displayName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                                            <p className="text-sm font-semibold text-[#EDEFF7] font-aeonikpro">{user.displayName}</p>
                                            <div className="flex space-x-1 flex-wrap">
                                                {user.isAdmin && (
                                                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        <Crown className="h-3 w-3 mr-1" />
                                                        Admin
                                                    </Badge>
                                                )}
                                                {user.isSeller && (
                                                    <>
                                                        <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                                                            <Store className="h-3 w-3 mr-1" />
                                                            Creator
                                                        </Badge>
                                                        {user.sellerProfile?.status === 'suspended' && (
                                                            <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">
                                                                <ShieldX className="h-3 w-3 mr-1" />
                                                                Suspended
                                                            </Badge>
                                                        )}
                                                        {user.sellerProfile?.status === 'pending' && (
                                                            <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Pending
                                                            </Badge>
                                                        )}
                                                        {user.sellerProfile?.status === 'active' && (
                                                            <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}
                                                {!user.isAdmin && !user.isSeller && (
                                                    <Badge variant="outline" className="bg-[#40424D]/30">
                                                        <User className="h-3 w-3 mr-1" />
                                                        User
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-[#9DA2B3]">{user.email}</p>
                                        <p className="text-xs text-[#9DA2B3]/60">
                                            Joined {formatDate(user.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4 ml-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium text-[#EDEFF7]">
                                            {user._count.workflows} workflows
                                        </div>
                                        <div className="text-xs text-[#9DA2B3]/70">
                                            {user._count.orders} orders
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(user)}
                                            className="text-xs"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={10}
                baseUrl="/admin/users"
            />

            {/* User Details Modal */}
            <UserDetailsModal
                user={selectedUser}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false)
                    setSelectedUser(null)
                }}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
            />

            {/* User Edit Modal */}
            <UserEditModal
                user={selectedUser}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setSelectedUser(null)
                }}
                onSave={handleSaveUser}
            />
        </div>
    )
}
