'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, Mail, Phone, Globe, User, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SellerInfo {
  displayName: string
  storeName?: string
  supportEmail?: string
  phoneNumber?: string
  countryCode?: string
  websiteUrl?: string
  avatarUrl?: string
}

interface ContactSellerButtonProps {
  seller: SellerInfo
  workflowTitle?: string
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function ContactSellerButton({
  seller,
  workflowTitle,
  className,
  variant = 'outline',
  size = 'default',
}: ContactSellerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState(workflowTitle ? `Question about: ${workflowTitle}` : '')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderName, setSenderName] = useState('')

  const getCountryFlag = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🌍'

    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0))

    return String.fromCodePoint(...codePoints)
  }

  const handleEmailContact = () => {
    if (!seller.supportEmail) return

    const emailSubject = encodeURIComponent(subject || 'Contact from FlowMarket')
    const emailBody = encodeURIComponent(
      `Hello ${seller.displayName},\n\n${message}\n\nBest regards,\n${senderName || 'A FlowMarket user'}`
    )

    window.open(`mailto:${seller.supportEmail}?subject=${emailSubject}&body=${emailBody}`, '_blank')
    setIsOpen(false)
  }

  const handlePhoneContact = () => {
    if (!seller.phoneNumber) return
    window.open(`tel:${seller.phoneNumber}`, '_blank')
  }

  const handleWebsiteContact = () => {
    if (!seller.websiteUrl) return
    window.open(seller.websiteUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={cn('cursor-pointer', className)}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Seller
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              {seller.avatarUrl ? (
                <img
                  src={seller.avatarUrl}
                  alt={seller.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="font-semibold">{seller.storeName || seller.displayName}</p>
              <p className="text-sm text-gray-500 font-normal">Seller on FlowMarket</p>
            </div>
          </DialogTitle>
          <DialogDescription>Choose how you'd like to contact this seller</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seller Contact Options */}
          <div className="grid gap-3">
            {seller.supportEmail && (
              <Card className="p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-xs text-gray-500">{seller.supportEmail}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleEmailContact} className="cursor-pointer">
                    Send Email
                  </Button>
                </div>
              </Card>
            )}

            {seller.phoneNumber && (
              <Card className="p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Phone</p>
                      <p className="text-xs text-gray-500">{seller.phoneNumber}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handlePhoneContact} className="cursor-pointer">
                    Call
                  </Button>
                </div>
              </Card>
            )}

            {seller.websiteUrl && (
              <Card className="p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Website</p>
                      <p className="text-xs text-gray-500">{seller.websiteUrl.replace(/^https?:\/\//, '')}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleWebsiteContact} className="cursor-pointer">
                    Visit
                  </Button>
                </div>
              </Card>
            )}

            {seller.countryCode && (
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Location</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{getCountryFlag(seller.countryCode)}</span>
                      {seller.countryCode.toUpperCase()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {!seller.supportEmail && !seller.phoneNumber && !seller.websiteUrl && (
            <Card className="p-4 text-center">
              <p className="text-sm text-gray-500">This seller hasn't provided contact information yet.</p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
