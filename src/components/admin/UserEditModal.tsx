'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Crown, Store, User, Mail, Save, X, Shield, AlertTriangle } from 'lucide-react'

interface UserEditModalProps {
    user: {
        id: string
        displayName: string
        email: string
        avatarUrl?: string | null
        isAdmin: boolean
        isSeller: boolean
        sellerProfile?: {
            storeName?: string
            bio?: string
            websiteUrl?: string
            phoneNumber?: string
            countryCode?: string
            status?: string
        } | null
    } | null
    isOpen: boolean
    onClose: () => void
    onSave: (userId: string, data: any) => void
}

export function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        isAdmin: false,
        isSeller: false,
        sellerProfile: {
            storeName: '',
            bio: '',
            websiteUrl: '',
            phoneNumber: '',
            countryCode: '',
            status: 'active'
        }
    })

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName,
                email: user.email,
                isAdmin: user.isAdmin,
                isSeller: user.isSeller,
                sellerProfile: {
                    storeName: user.sellerProfile?.storeName || '',
                    bio: user.sellerProfile?.bio || '',
                    websiteUrl: user.sellerProfile?.websiteUrl || '',
                    phoneNumber: user.sellerProfile?.phoneNumber || '',
                    countryCode: user.sellerProfile?.countryCode || '',
                    status: user.sellerProfile?.status || 'active'
                }
            })
        }
    }, [user])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (user) {
            onSave(user.id, formData)
        }
    }

    const handleInputChange = (field: string, value: any) => {
        if (field.startsWith('sellerProfile.')) {
            const sellerField = field.replace('sellerProfile.', '')
            setFormData(prev => ({
                ...prev,
                sellerProfile: {
                    ...prev.sellerProfile,
                    [sellerField]: value
                }
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }))
        }
    }

    if (!user) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl || ''} alt={user.displayName} />
                            <AvatarFallback>
                                {user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold">Edit User</h2>
                            <p className="text-sm text-muted-foreground">Modify user information and permissions</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={formData.displayName}
                                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                                    placeholder="Enter display name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Permissions */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Permissions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Crown className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <Label htmlFor="isAdmin" className="text-sm font-medium">Admin Access</Label>
                                        <p className="text-xs text-muted-foreground">Full administrative privileges</p>
                                    </div>
                                </div>
                                <Switch
                                    id="isAdmin"
                                    checked={formData.isAdmin}
                                    onCheckedChange={(checked) => handleInputChange('isAdmin', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Store className="h-5 w-5 text-green-600" />
                                    <div>
                                        <Label htmlFor="isSeller" className="text-sm font-medium">Creator Access</Label>
                                        <p className="text-xs text-muted-foreground">Can create and sell workflows</p>
                                    </div>
                                </div>
                                <Switch
                                    id="isSeller"
                                    checked={formData.isSeller}
                                    onCheckedChange={(checked) => handleInputChange('isSeller', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Creator Profile */}
                    {formData.isSeller && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-medium mb-4">Creator Profile</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="storeName">Store Name</Label>
                                        <Input
                                            id="storeName"
                                            value={formData.sellerProfile.storeName}
                                            onChange={(e) => handleInputChange('sellerProfile.storeName', e.target.value)}
                                            placeholder="Enter store name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={formData.sellerProfile.bio}
                                            onChange={(e) => handleInputChange('sellerProfile.bio', e.target.value)}
                                            placeholder="Enter creator bio"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="websiteUrl">Website URL</Label>
                                        <Input
                                            id="websiteUrl"
                                            type="url"
                                            value={formData.sellerProfile.websiteUrl}
                                            onChange={(e) => handleInputChange('sellerProfile.websiteUrl', e.target.value)}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="countryCode">Country Code</Label>
                                            <Input
                                                id="countryCode"
                                                value={formData.sellerProfile.countryCode}
                                                onChange={(e) => handleInputChange('sellerProfile.countryCode', e.target.value)}
                                                placeholder="+1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phoneNumber">Phone Number</Label>
                                            <Input
                                                id="phoneNumber"
                                                value={formData.sellerProfile.phoneNumber}
                                                onChange={(e) => handleInputChange('sellerProfile.phoneNumber', e.target.value)}
                                                placeholder="1234567890"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="status" className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4" />
                                            <span>Creator Status</span>
                                        </Label>
                                        <Select
                                            value={formData.sellerProfile.status}
                                            onValueChange={(value) => handleInputChange('sellerProfile.status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">
                                                    <div className="flex items-center space-x-2">
                                                        <Shield className="h-4 w-4 text-green-600" />
                                                        <span>Active - Can sell workflows</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="suspended">
                                                    <div className="flex items-center space-x-2">
                                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                                        <span>Suspended - Restricted from marketplace</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="pending">
                                                    <div className="flex items-center space-x-2">
                                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                        <span>Pending - Awaiting approval</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formData.sellerProfile.status === 'suspended' && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center space-x-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>Workflows will be disabled and hidden from marketplace</span>
                                            </p>
                                        )}
                                        {formData.sellerProfile.status === 'active' && user?.sellerProfile?.status === 'suspended' && (
                                            <p className="text-sm text-green-600 mt-1 flex items-center space-x-1">
                                                <Shield className="h-3 w-3" />
                                                <span>Seller will be unrestricted (workflows remain disabled until republished)</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                        <Button type="submit">
                            <Save className="h-4 w-4 mr-1" />
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
