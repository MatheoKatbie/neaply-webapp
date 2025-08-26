'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Crown, Store, User, Mail, Calendar, MapPin, Globe, Phone, Edit, Trash2, X, AlertTriangle } from 'lucide-react'

interface UserDetailsModalProps {
    user: {
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
    } | null
    isOpen: boolean
    onClose: () => void
    onEdit: (userId: string) => void
    onDelete: (userId: string) => void
}

export function UserDetailsModal({ user, isOpen, onClose, onEdit, onDelete }: UserDetailsModalProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

    if (!user) return null

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date))
    }

    const getRoleBadge = () => {
        if (user.isAdmin) {
            return (
                <Badge variant="default" className="bg-purple-100 text-purple-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                </Badge>
            )
        } else if (user.isSeller) {
            return (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Store className="h-3 w-3 mr-1" />
                    Creator
                </Badge>
            )
        } else {
            return (
                <Badge variant="outline">
                    <User className="h-3 w-3 mr-1" />
                    User
                </Badge>
            )
        }
    }

    const getSellerStatusBadge = () => {
        if (!user.sellerProfile?.status) return null

        const statusColors = {
            active: 'bg-green-100 text-green-800',
            suspended: 'bg-red-100 text-red-800',
            pending: 'bg-yellow-100 text-yellow-800'
        }

        return (
            <Badge variant="outline" className={statusColors[user.sellerProfile.status as keyof typeof statusColors]}>
                {user.sellerProfile.status.charAt(0).toUpperCase() + user.sellerProfile.status.slice(1)}
            </Badge>
        )
    }

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true)
    }

    const handleConfirmDelete = () => {
        onDelete(user.id)
        setShowDeleteConfirmation(false)
        onClose()
    }

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatarUrl || ''} alt={user.displayName} />
                            <AvatarFallback className="text-lg">
                                {user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-semibold">{user.displayName}</h2>
                            <div className="flex items-center space-x-2 mt-1">
                                {getRoleBadge()}
                                {getSellerStatusBadge()}
                            </div>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        User account details and statistics
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Statistics */}
                    <div>
                        <h3 className="text-lg font-medium mb-3">Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{user._count.workflows}</div>
                                <div className="text-sm text-muted-foreground">Workflows</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{user._count.orders}</div>
                                <div className="text-sm text-muted-foreground">Orders</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{user._count.reviews}</div>
                                <div className="text-sm text-muted-foreground">Reviews</div>
                            </div>
                        </div>
                    </div>

                    {/* Creator Profile Information */}
                    {user.sellerProfile && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium mb-3">Creator Profile</h3>
                                <div className="space-y-3">
                                    {user.sellerProfile.storeName && (
                                        <div className="flex items-center space-x-3">
                                            <Store className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{user.sellerProfile.storeName}</span>
                                        </div>
                                    )}
                                    {user.sellerProfile.bio && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">{user.sellerProfile.bio}</p>
                                        </div>
                                    )}
                                    {user.sellerProfile.websiteUrl && (
                                        <div className="flex items-center space-x-3">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={user.sellerProfile.websiteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {user.sellerProfile.websiteUrl}
                                            </a>
                                        </div>
                                    )}
                                    {user.sellerProfile.phoneNumber && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                {user.sellerProfile.countryCode && `+${user.sellerProfile.countryCode} `}
                                                {user.sellerProfile.phoneNumber}
                                            </span>
                                        </div>
                                    )}
                                    {user.sellerProfile.countryCode && !user.sellerProfile.phoneNumber && (
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Country: {user.sellerProfile.countryCode}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Delete Confirmation Alert */}
                    {showDeleteConfirmation && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <div className="space-y-3">
                                    <p className="font-medium">Delete User Account</p>
                                    <p className="text-sm">
                                        Are you sure you want to delete the account for <strong>{user.displayName}</strong>?
                                        This action cannot be undone and will permanently remove all user data including:
                                    </p>
                                    <ul className="list-disc list-inside text-sm space-y-1">
                                        <li>User profile and settings</li>
                                        <li>All workflows ({user._count.workflows})</li>
                                        <li>All orders ({user._count.orders})</li>
                                        <li>All reviews ({user._count.reviews})</li>
                                        {user.sellerProfile && <li>Creator profile and store</li>}
                                    </ul>
                                    <div className="flex space-x-2 pt-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleConfirmDelete}
                                        >
                                            Delete Account
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelDelete}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-1" />
                        Close
                    </Button>
                    <Button onClick={() => onEdit(user.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit User
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteClick}
                        disabled={showDeleteConfirmation}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Account
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
