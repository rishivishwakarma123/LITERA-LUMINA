import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from './ui/button'
import { apiRequest } from '../lib/api'

export type CheckoutCartItem = {
  id: string
  productId: number
  title: string
  price: number
  quantity: number
  availableQuantity: number
}

export type CheckoutOrder = {
  id: number
  subtotal: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  shippingAddress: string
  orderStatus: string
  paymentStatus: string
  transactionRefNo: string
  createdAt: string
}

type CheckoutConfig = {
  taxRate: number
  shippingFee: number
  freeShippingThreshold: number
  upiReceiverPhone: string
}

type CheckoutModalProps = {
  cart: CheckoutCartItem[]
  email: string
  onBack: () => void
  onOrderPlaced: (order: CheckoutOrder) => void
}

export function CheckoutModal({ cart, email, onBack, onOrderPlaced }: CheckoutModalProps) {
  const [config, setConfig] = useState<CheckoutConfig | null>(null)
  const [address, setAddress] = useState('')
  const [transactionRefNo, setTransactionRefNo] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void apiRequest<CheckoutConfig>('/api/checkout/config')
      .then(setConfig)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load checkout settings')
      })
  }, [])

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )
  const tax = config ? subtotal * config.taxRate : 0
  const shipping = config && subtotal < config.freeShippingThreshold ? config.shippingFee : 0
  const total = subtotal + tax + shipping

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const order = await apiRequest<CheckoutOrder>('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: address.trim(), transactionRefNo: transactionRefNo.trim() }),
      })
      onOrderPlaced(order)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to place this order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button onClick={onBack} className="mt-6">Back to marketplace</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
        <ArrowLeft className="size-4" /> Back to Cart
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={placeOrder} className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div>
            <h1 className="text-2xl font-bold">UPI checkout</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">Shipping address</span>
            <textarea
              required
              maxLength={1000}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-input bg-background p-3 text-sm"
              placeholder="Name, house/building, street, city, state, PIN code"
            />
          </label>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Manual UPI payment — not verified automatically</p>
            <p className="mt-1">Pay ₹{config ? total.toFixed(2) : '…'} to the receiver phone below using your UPI app, then enter the transaction reference. Your payment remains pending until an administrator verifies it.</p>
            {config ? (
              <p className="mt-2 font-semibold">UPI receiver phone: {config.upiReceiverPhone}</p>
            ) : (
              <p className="mt-2">Loading payment instructions…</p>
            )}
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-semibold">UPI transaction reference</span>
            <input
              required
              maxLength={100}
              value={transactionRefNo}
              onChange={(event) => setTransactionRefNo(event.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              placeholder="Enter the UPI/GPay reference number"
            />
          </label>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={!config || isSubmitting} className="h-12 w-full rounded-xl">
            {isSubmitting ? 'Submitting…' : `Submit order · ₹${config ? total.toFixed(2) : '…'}`}
          </Button>
        </form>

        <aside className="h-fit rounded-3xl bg-slate-900 p-6 text-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
            <ShieldCheck className="size-5 text-emerald-400" />
            <h2 className="text-lg font-bold">Order summary</h2>
          </div>
          <ul className="my-4 space-y-3">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-sm">
                <span>{item.title} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-slate-700 pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>₹{subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>Tax ({config ? `${(config.taxRate * 100).toFixed(0)}%` : '…'})</dt><dd>₹{tax.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>₹{shipping.toFixed(2)}</dd></div>
            <div className="flex justify-between border-t border-slate-700 pt-3 text-base font-bold">
              <dt>Total</dt><dd>{config ? `₹${total.toFixed(2)}` : '…'}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
