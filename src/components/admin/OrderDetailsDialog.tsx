'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface OrderItemBrief {
    id: string
    unitPriceCents: number
    workflow: { title: string; seller: { displayName: string } }
}

interface OrderBrief {
    id: string
    status: string
    totalCents: number
    provider: string | null
    createdAt: string | Date
    paidAt: string | Date | null
    user: { displayName: string; email: string }
    items: OrderItemBrief[]
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date))
}

interface Props {
    order: OrderBrief
    trigger: React.ReactNode
}

export function OrderDetailsDialog({ order, trigger }: Props) {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Order #{order.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                        <div>Customer: <span className="text-foreground font-medium">{order.user.displayName}</span> ({order.user.email})</div>
                        <div>Created: {formatDate(order.createdAt)}</div>
                        {order.paidAt && <div>Paid: {formatDate(order.paidAt)}</div>}
                        <div>Provider: {order.provider || '—'}</div>
                        <div>Total: <span className="text-foreground font-medium">{formatCurrency(order.totalCents)}</span></div>
                        <div>Status: {order.status}</div>
                    </div>
                    <div className="space-y-2">
                        <div className="font-medium">Items</div>
                        <div className="space-y-1">
                            {order.items.map((item) => (
                                <div key={item.id} className="text-sm text-muted-foreground">
                                    <span className="text-foreground">{item.workflow.title}</span>
                                    <span> by {item.workflow.seller.displayName}</span>
                                    <span> • {formatCurrency(item.unitPriceCents)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="outline">Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}


