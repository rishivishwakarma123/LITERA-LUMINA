'use client'

import { useEffect, useState } from 'react'
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from './ui/button'
import { apiRequest } from '../lib/api'

type CartItem = {
  id: string
  productId: number
  title: string
  price: number
  quantity: number
  availableQuantity: number
}

type CartPageProps = {
  cart: CartItem[]
  onRemoveItem: (id: string) => void
  onUpdateQuantity: (item: CartItem, quantity: number) => void
  onBackToShop: () => void
  onProceedToCheckout: () => void
}

// 1. Yahan function parameters mein onProceedToCheckout add kiya
export function CartPage({ cart, onRemoveItem, onUpdateQuantity, onBackToShop, onProceedToCheckout }: CartPageProps) {
  const [config, setConfig] = useState<{
    taxRate: number
    shippingFee: number
    freeShippingThreshold: number
  } | null>(null)
  const [configError, setConfigError] = useState('')
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * (config?.taxRate ?? 0)
  const shipping = config && subtotal < config.freeShippingThreshold ? config.shippingFee : 0
  const totalPrice = subtotal + tax + shipping
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    void apiRequest<typeof config>('/api/checkout/config')
      .then(setConfig)
      .catch((error: unknown) => setConfigError(
        error instanceof Error ? error.message : 'Unable to load checkout totals',
      ))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={onBackToShop} 
        className="mb-6 gap-2 rounded-xl"
      >
        <ArrowLeft className="size-4" /> Continue Shopping
      </Button>

      <h1 className="text-3xl font-extrabold tracking-tight mb-8">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <ShoppingBag className="size-12 text-muted-foreground mb-3" />
          <p className="text-xl font-semibold">Your cart is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add some books from the marketplace to see them here.</p>
          <Button onClick={onBackToShop} className="mt-6 rounded-xl bg-primary text-primary-foreground">
            Explore Books
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Side: Added Products List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="text-lg font-extrabold text-primary mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.title} quantity`}
                      disabled={item.quantity <= 1}
                      onClick={() => onUpdateQuantity(item, item.quantity - 1)}
                      className="size-8 rounded border disabled:opacity-40"
                    >−</button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.title} quantity`}
                      disabled={item.quantity >= item.availableQuantity}
                      onClick={() => onUpdateQuantity(item, item.quantity + 1)}
                      className="size-8 rounded border disabled:opacity-40"
                    >+</button>
                    <span className="text-xs text-muted-foreground">{item.availableQuantity} available</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemoveItem(item.id)} 
                  className="text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Right Side: Price Summary Box */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-fit">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm py-2 border-b border-border">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-semibold">{itemCount} items</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-muted-foreground">Tax ({config ? `${(config.taxRate * 100).toFixed(0)}%` : '…'})</span>
              <span className="font-semibold">{config ? `₹${tax.toFixed(2)}` : '…'}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-border">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">{config ? `₹${shipping.toFixed(2)}` : '…'}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold py-4">
              <span>Total Amount</span>
              <span className="text-primary">{config ? `₹${totalPrice.toFixed(2)}` : '…'}</span>
            </div>
            {configError && <p role="alert" className="text-xs text-destructive">{configError}</p>}
            
            {/* 2. Yahan Proceed to Checkout button mein onClick lagaya */}
            <Button 
              onClick={onProceedToCheckout}
              disabled={!config}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold mt-4"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}