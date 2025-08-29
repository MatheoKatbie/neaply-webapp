'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, Crown, Store, User, Eye, Shield, ShieldX, Clock } from 'lucide-react'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters'
import { UserDetailsModal } from '@/components/admin/UserDetailsModal'
import { UserEditModal } from '@/components/admin/UserEditModal'
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground font-space-grotesk">Users Management</h1>
                <p className="text-muted-foreground">Manage user accounts and permissions</p>
            </div>

            <AdminSearchFilters
                searchPlaceholder="Search users by name or email..."
                filters={filterOptions}
                dateRangeFilter={true}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>All Users ({totalCount})</span>
                    </CardTitle>
                    <CardDescription>
                        View and manage user accounts, roles, and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted"
                            >
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatarUrl || ''} alt={user.displayName} />
                                        <AvatarFallback>
                                            {user.displayName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-medium">{user.displayName}</p>
                                            <div className="flex space-x-1">
                                                {user.isAdmin && (
                                                    <Badge variant="default" className="bg-purple-100 text-purple-800">
                                                        <Crown className="h-3 w-3 mr-1" />
                                                        Admin
                                                    </Badge>
                                                )}
                                                {user.isSeller && (
                                                    <>
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                            <Store className="h-3 w-3 mr-1" />
                                                            Creator
                                                        </Badge>
                                                        {user.sellerProfile?.status === 'suspended' && (
                                                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                                                                <ShieldX className="h-3 w-3 mr-1" />
                                                                Suspended
                                                            </Badge>
                                                        )}
                                                        {user.sellerProfile?.status === 'pending' && (
                                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Pending
                                                            </Badge>
                                                        )}
                                                        {user.sellerProfile?.status === 'active' && (
                                                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}
                                                {!user.isAdmin && !user.isSeller && (
                                                    <Badge variant="outline">
                                                        <User className="h-3 w-3 mr-1" />
                                                        User
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Joined {formatDate(user.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-sm font-medium">
                                            {user._count.workflows} workflows
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {user._count.orders} orders
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(user)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Details
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
