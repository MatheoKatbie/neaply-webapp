'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react'

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface MultiVendorCheckoutProps {
  cartId: string
  totalAmount: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

function CheckoutForm({ cartId, totalAmount, onSuccess, onError }: MultiVendorCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<string | null>(null)

  useEffect(() => {
    // Create SetupIntent when component mounts
    createSetupIntent()
  }, [])

  const createSetupIntent = async () => {
    try {
      const response = await fetch('/api/checkout/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create setup intent')
      }

      const data = await response.json()
      setSetupIntentClientSecret(data.clientSecret)
    } catch (error) {
      setError('Failed to initialize payment form')
      console.error('SetupIntent creation error:', error)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !setupIntentClientSecret) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Confirm the SetupIntent to save the payment method
      const { error: setupError, setupIntent } = await stripe.confirmCardSetup(setupIntentClientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (setupError) {
        throw new Error(setupError.message || 'Failed to save payment method')
      }

      if (setupIntent?.status === 'succeeded' && setupIntent.payment_method) {
        // Now process the multi-vendor payment with the saved payment method
        const paymentResponse = await fetch('/api/checkout/multi-vendor-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodId: setupIntent.payment_method,
            cartId: cartId,
          }),
        })

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json()
          throw new Error(errorData.error || 'Payment failed')
        }

        const paymentResult = await paymentResponse.json()

        if (paymentResult.allSucceeded) {
          // All payments succeeded
          // Redirect to success page with the first order ID
          const firstOrderId = paymentResult.successfulPayments[0]?.orderId
          if (firstOrderId) {
            window.location.href = `/checkout/success?order_id=${firstOrderId}`
          } else {
            onSuccess?.()
          }
        } else {
          // Some payments failed
          const failedSellers = paymentResult.failedPayments.map((p: any) => p.sellerName).join(', ')

          setError(`Some payments failed: ${failedSellers}`)
          onError?.(`Some payments failed: ${failedSellers}`)
        }
      } else {
        throw new Error('Failed to save payment method')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (priceCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceCents / 100)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Details</label>
            <div className="border border-[#9DA2B3]/25 focus-within:border-[#9DA2B3]/50 rounded-md p-3">
              <CardElement
              className=' border-0 outline-none text-primary-foreground'
                options={{
                  
                  style: {
                    base: {
                      iconColor: 'white',
                      fontSize: '16px',
                      color: 'white',
                      '::placeholder': {
                        color: 'text-muted-foreground',
                      },
                    },
                    invalid: {
                      color: 'destructive-foreground',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="bg-[#1E1E24] p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={!stripe || loading || !setupIntentClientSecret} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Pay {formatPrice(totalAmount)}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export default function MultiVendorCheckout(props: MultiVendorCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
