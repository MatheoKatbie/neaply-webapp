'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  User,
  Shield,
  Key,
  Camera,
  Store,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Upload,
  Copy,
  Smartphone,
  QrCode,
  Monitor,
  Calendar,
  MapPin,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { TwoFactorSetup, TwoFactorStatus, RememberedDevice } from '@/types/auth'

interface UserProfile {
  displayName: string
  email: string
  avatarUrl?: string
  isSeller: boolean
}

interface StoreInfo {
  storeName: string
  slug: string
  bio?: string
}

interface Security2FA extends TwoFactorStatus {
  setupData?: TwoFactorSetup
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    avatarUrl: '',
    isSeller: false,
  })

  // Store state
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    storeName: '',
    slug: '',
    bio: '',
  })

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFA, setTwoFA] = useState<Security2FA>({ enabled: false, methods: [] })
  const [totpCode, setTotpCode] = useState('')
  const [setupStep, setSetupStep] = useState<'qr' | 'verify' | 'backup'>('qr')

  // Device states
  const [rememberedDevices, setRememberedDevices] = useState<RememberedDevice[]>([])
  const [loadingDevices, setLoadingDevices] = useState(false)

  // Modal states
  const [showDeleteStoreModal, setShowDeleteStoreModal] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [show2FASetupModal, setShow2FASetupModal] = useState(false)
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false)

  // File upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to extract filename from avatar URL
  const extractFilenameFromAvatarUrl = (avatarUrl: string): string | null => {
    try {
      // Handle different URL formats
      if (avatarUrl.includes('/storage/v1/object/public/avatars/')) {
        // Full Supabase URL
        const urlParts = avatarUrl.split('/storage/v1/object/public/avatars/')
        return urlParts.length > 1 ? urlParts[1] : null
      } else if (avatarUrl.includes('/avatars/')) {
        // Relative URL or CDN URL
        const urlParts = avatarUrl.split('/avatars/')
        return urlParts.length > 1 ? urlParts[1] : null
      } else {
        // Just filename
        return avatarUrl.split('/').pop() || null
      }
    } catch (error) {
      console.warn('Error extracting filename from URL:', error)
      return null
    }
  }

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatar_url,
        isSeller: user.isSeller,
      })

      if (user.isSeller) {
        fetchStoreInfo()
      }

      fetch2FAStatus()
      fetchRememberedDevices()
    }
  }, [user])

  const fetchStoreInfo = async () => {
    try {
      const response = await fetch('/api/store/info')
      if (response.ok) {
        const data = await response.json()
        setStoreInfo(data)
      }
    } catch (error) {
      console.error('Error fetching store info:', error)
    }
  }

  const fetch2FAStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status')
      if (response.ok) {
        const data = await response.json()
        setTwoFA(data)
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error)
    }
  }

  const fetchRememberedDevices = async () => {
    try {
      setLoadingDevices(true)
      const response = await fetch('/api/auth/devices')
      if (response.ok) {
        const data = await response.json()
        setRememberedDevices(data.devices || [])
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoadingDevices(false)
    }
  }

  const removeDevice = async (deviceId: string) => {
    try {
      setLoadingDevices(true)
      const response = await fetch('/api/auth/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      })

      if (response.ok) {
        setRememberedDevices((prev) => prev.filter((device) => device.id !== deviceId))
        toast.success('Device Removed', {
          description: 'The device has been removed from your remembered devices.',
        })
      } else {
        throw new Error('Failed to remove device')
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to remove device. Please try again.',
      })
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        }),
      })

      if (response.ok) {
        await refreshUser()
        toast.success('Profile Updated', {
          description: 'Your profile has been updated successfully.',
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to update profile. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true)
    try {
      // Validate file size (2MB max)
      const maxSize = 2 * 1024 * 1024 // 2MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size must be less than 2MB')
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPG, PNG and GIF files are allowed')
      }

      console.log('Starting avatar upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })

      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`

      console.log('Uploading to Supabase storage with filename:', fileName)

      // Delete old avatar if exists
      if (profile.avatarUrl) {
        try {
          const oldFileName = extractFilenameFromAvatarUrl(profile.avatarUrl)

          // Only delete if filename exists and belongs to current user
          if (oldFileName && oldFileName.includes(user?.id || '')) {
            console.log('Deleting old avatar:', oldFileName)
            const { error: deleteError } = await supabase.storage.from('avatars').remove([oldFileName])

            if (deleteError) {
              console.warn('Failed to delete old avatar:', deleteError)
            } else {
              console.log('Old avatar deleted successfully')
            }
          }
        } catch (deleteError) {
          console.warn('Error deleting old avatar:', deleteError)
        }
      }

      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file)

      if (error) {
        console.error('Supabase storage error:', error)
        throw new Error(`Storage error: ${error.message}`)
      }

      console.log('Upload successful:', data)

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName)

      console.log('Generated public URL:', publicUrl)

      setProfile((prev) => ({ ...prev, avatarUrl: publicUrl }))

      // Update the database with the new avatar URL (API will also sync with Supabase Auth)
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarUrl: publicUrl,
        }),
      })

      if (response.ok) {
        // Refresh user data in context to update navbar
        await refreshUser()
      } else {
        console.warn('Failed to update avatar in database')
      }

      toast.success('Avatar Uploaded', {
        description: 'Your avatar has been uploaded successfully.',
      })
    } catch (error: any) {
      console.error('Avatar upload error:', error)

      let errorMessage = 'Failed to upload avatar. Please try again.'

      if (error.message) {
        errorMessage = error.message
      }

      // Handle specific Supabase errors
      if (error.message?.includes('row-level security policy')) {
        errorMessage =
          'Storage permissions not configured properly. The storage policies need to be updated in Supabase.'
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Storage bucket not configured. Please contact support.'
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = 'Permission denied. Storage policies may need to be updated.'
      } else if (error.message?.includes('size')) {
        errorMessage = 'File too large. Maximum size is 2MB.'
      } else if (error.message?.includes('type') || error.message?.includes('format')) {
        errorMessage = 'Invalid file type. Only JPG, PNG and GIF are allowed.'
      } else if (error.message?.includes('duplicate')) {
        errorMessage = 'File already exists. Please try again.'
      }

      toast.error('Upload Failed', {
        description: errorMessage,
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Error', {
        description: 'New passwords do not match.',
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setShowPasswordChangeModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      toast.success('Password Updated', {
        description: 'Your password has been changed successfully.',
      })
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to change password. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    if (twoFA.enabled) {
      // Disable 2FA
      try {
        const response = await fetch('/api/auth/2fa/disable', { method: 'POST' })
        if (response.ok) {
          setTwoFA({ enabled: false, methods: [] })
          toast.success('2FA Disabled', {
            description: 'Two-factor authentication has been disabled.',
          })
        }
      } catch (error) {
        toast.error('Error', {
          description: 'Failed to disable 2FA.',
        })
      }
    } else {
      // Start 2FA setup
      await start2FASetup()
    }
  }

  const start2FASetup = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/2fa/setup', { method: 'POST' })

      if (response.ok) {
        const setupData: TwoFactorSetup = await response.json()
        setTwoFA((prev) => ({ ...prev, setupData }))
        setSetupStep('qr')
        setShow2FASetupModal(true)
      } else {
        const error = await response.json()
        toast.error('Setup Failed', {
          description: error.error || 'Failed to start 2FA setup',
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to start 2FA setup. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const verify2FASetup = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.error('Invalid Code', {
        description: 'Please enter a 6-digit code from your authenticator app.',
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode }),
      })

      if (response.ok) {
        const result = await response.json()
        setTwoFA((prev) => ({
          ...prev,
          enabled: true,
          backupCodes: result.backupCodes,
          setupData: undefined,
        }))
        setSetupStep('backup')
        setTotpCode('')

        // Refresh 2FA status
        await fetch2FAStatus()

        toast.success('2FA Enabled', {
          description: 'Two-factor authentication has been enabled successfully.',
        })
      } else {
        const error = await response.json()
        toast.error('Verification Failed', {
          description: error.error || 'Invalid verification code. Please try again.',
        })
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to verify 2FA setup. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied', {
      description: 'Copied to clipboard',
    })
  }

  const complete2FASetup = () => {
    setShow2FASetupModal(false)
    setSetupStep('qr')
    setTotpCode('')
  }

  const handleDeleteStore = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/store/delete', { method: 'DELETE' })

      if (response.ok) {
        await refreshUser()
        setShowDeleteStoreModal(false)
        toast.success('Store Deleted', {
          description: 'Your store has been permanently deleted.',
        })
      } else {
        throw new Error('Failed to delete store')
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to delete store. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account, security, and preferences.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${user.isSeller ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Devices
          </TabsTrigger>
          {user.isSeller && (
            <TabsTrigger value="store" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Store
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                  <AvatarFallback className="text-lg">{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2"
                    onClick={() => {
                      fileInputRef.current?.click()
                    }}
                  >
                    {uploadingAvatar ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleAvatarUpload(file)
                        // Reset input to allow uploading the same file again
                        e.target.value = ''
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs mt-2"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/test-storage')
                        const result = await response.json()
                        console.log('Storage test result:', result)

                        if (result.error) {
                          toast.error('Storage Test Failed', {
                            description: result.error + (result.details ? `: ${result.details}` : ''),
                          })
                        } else {
                          toast.success('Storage Test Passed', {
                            description: 'Storage is properly configured.',
                          })
                        }
                      } catch (error) {
                        console.error('Test error:', error)
                        toast.error('Test Failed', {
                          description: 'Could not test storage configuration.',
                        })
                      }
                    }}
                  >
                    Test Storage
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={profile.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={user.isSeller ? 'default' : 'secondary'}>
                  {user.isSeller ? 'Seller Account' : 'Buyer Account'}
                </Badge>
                {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
              </div>

              <Button onClick={handleProfileUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowPasswordChangeModal(true)} className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account with 2FA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Two-Factor Authentication</span>
                  {twoFA.enabled && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Enabled
                    </Badge>
                  )}
                </div>
                <Switch checked={twoFA.enabled} onCheckedChange={handleToggle2FA} />
              </div>
              {twoFA.enabled && (
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Two-factor authentication is active on your account.
                      {twoFA.enabledAt && (
                        <span className="block text-xs text-gray-500 mt-1">
                          Enabled on {new Date(twoFA.enabledAt).toLocaleDateString()}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBackupCodesModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    View Backup Codes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Remembered Devices</CardTitle>
              <CardDescription>
                Manage devices that don't require two-factor authentication when signing in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDevices ? (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">Loading devices...</div>
                </div>
              ) : rememberedDevices.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Remembered Devices</h3>
                  <p className="text-sm text-gray-500">
                    Devices you choose to remember during 2FA login will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rememberedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900">{device.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              Trusted
                            </Badge>
                          </div>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Last used: {new Date(device.lastUsed).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Added: {new Date(device.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {device.ipAddress && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                IP: {device.ipAddress}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 truncate">{device.userAgent}</div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDevice(device.id)}
                        disabled={loadingDevices}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {rememberedDevices.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Removing a device will require two-factor authentication the next time you sign in from that
                      device.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {twoFA.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>Device Security</CardTitle>
                <CardDescription>Settings related to device security and two-factor authentication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Protect your account with an additional security layer</p>
                  </div>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Remembered Devices</h4>
                    <p className="text-sm text-gray-500">
                      {rememberedDevices.length} device{rememberedDevices.length !== 1 ? 's' : ''} trusted
                    </p>
                  </div>
                  {rememberedDevices.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        rememberedDevices.forEach((device) => removeDevice(device.id))
                      }}
                      disabled={loadingDevices}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove All
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Store Tab (only for sellers) */}
        {user.isSeller && (
          <TabsContent value="store" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>Manage your store settings and information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input value={storeInfo.storeName} disabled className="bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Store URL</Label>
                    <Input value={`flowmarket.com/store/${storeInfo.slug}`} disabled className="bg-gray-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Input value={storeInfo.bio || 'No bio set'} disabled className="bg-gray-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Permanently delete your store and all associated data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteStoreModal(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Store
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Password Change Modal */}
      <Dialog open={showPasswordChangeModal} onOpenChange={setShowPasswordChangeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your new password below. Make sure it's strong and secure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordChangeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={loading || !newPassword || !confirmPassword}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Store Modal */}
      <Dialog open={showDeleteStoreModal} onOpenChange={setShowDeleteStoreModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your store? This action cannot be undone. All your workflows,
              sales data, and store information will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              This action is irreversible. All store data will be permanently lost.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteStoreModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStore} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Store Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Modal */}
      <Dialog open={show2FASetupModal} onOpenChange={setShow2FASetupModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Setup Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {setupStep === 'qr' && 'Scan the QR code with your authenticator app'}
              {setupStep === 'verify' && 'Enter the verification code from your authenticator app'}
              {setupStep === 'backup' && 'Save your backup codes in a secure location'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code Step */}
            {setupStep === 'qr' && twoFA.setupData && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <img src={twoFA.setupData.qrCode} alt="QR Code for 2FA setup" className="w-48 h-48" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Manual Entry Key</Label>
                  <div className="flex items-center gap-2">
                    <Input value={twoFA.setupData.secret} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(twoFA.setupData!.secret)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Use this key if you can't scan the QR code</p>
                </div>

                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    1. Install an authenticator app (Google Authenticator, Authy, etc.)
                    <br />
                    2. Scan the QR code or enter the key manually
                    <br />
                    3. Click "Continue" when ready to verify
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Verification Step */}
            {setupStep === 'verify' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totpCode">Verification Code</Label>
                  <Input
                    id="totpCode"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-lg font-mono tracking-wider"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500">Enter the 6-digit code from your authenticator app</p>
                </div>
              </div>
            )}

            {/* Backup Codes Step */}
            {setupStep === 'backup' && twoFA.backupCodes && (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Save these backup codes in a secure location. You can use them to access your account if you lose
                    your device.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {twoFA.backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span>{code}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code)} className="h-6 w-6 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(twoFA.backupCodes!.join('\n'))}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Codes
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            {setupStep === 'qr' && (
              <>
                <Button variant="outline" onClick={() => setShow2FASetupModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setSetupStep('verify')}>Continue</Button>
              </>
            )}

            {setupStep === 'verify' && (
              <>
                <Button variant="outline" onClick={() => setSetupStep('qr')}>
                  Back
                </Button>
                <Button onClick={verify2FASetup} disabled={loading || totpCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </>
            )}

            {setupStep === 'backup' && (
              <Button onClick={complete2FASetup} className="w-full">
                Complete Setup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Modal */}
      <Dialog open={showBackupCodesModal} onOpenChange={setShowBackupCodesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>Use these codes to access your account if you lose your device.</DialogDescription>
          </DialogHeader>

          {twoFA.backupCodes && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 gap-2 font-mono text-sm">
                  {twoFA.backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>{code}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code)} className="h-6 w-6 p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => copyToClipboard(twoFA.backupCodes!.join('\n'))}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Codes
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowBackupCodesModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
