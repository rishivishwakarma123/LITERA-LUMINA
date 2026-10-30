import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ReceiptText } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { Button } from './ui/button'

type PaymentRecord = {
  id: number
  orderId: number
  payerName: string
  transactionRefNo: string
  amount: number
  paymentStatus: string
  paymentMethod: string
  direction: string
  timestamp: string
}

type OrderRecord = {
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
  items: Array<{ title: string; quantity: number; unitPrice: number }>
}

type PaymentHistoryProps = {
  notice?: string
  onBack: () => void
}

export function PaymentHistory({ notice, onBack }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const [paymentRows, orderRows] = await Promise.all([
        apiRequest<PaymentRecord[]>('/api/payments/mine'),
        apiRequest<OrderRecord[]>('/api/orders/mine'),
      ])
      setPayments(paymentRows)
      setOrders(orderRows)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load payment history')
    }
  }, [])

  useEffect(() => {
    let active = true
    void Promise.all([
      apiRequest<PaymentRecord[]>('/api/payments/mine'),
      apiRequest<OrderRecord[]>('/api/orders/mine'),
    ])
      .then(([paymentRows, orderRows]) => {
        if (!active) return
        setPayments(paymentRows)
        setOrders(orderRows)
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load payment history')
        }
      })
    return () => {
      active = false
    }
  }, [])

  const cancelOrder = async (id: number) => {
    try {
      await apiRequest(`/api/orders/${id}/cancel`, { method: 'POST' })
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to cancel order')
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
        <ArrowLeft className="size-4" /> Back to marketplace
      </Button>
      <h1 className="text-3xl font-extrabold">Orders & payment history</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Buyers see outgoing payments; sellers see incoming amounts for their listings. UPI references remain pending until admin verification.
      </p>
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

      <h2 className="mt-8 text-xl font-bold">Payments</h2>
      <div className="mt-3 space-y-3">
        {payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No payment history yet.</div>
        ) : payments.map((payment) => (
          <article key={payment.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ReceiptText className="mt-1 size-5 text-primary" />
              <div>
                <p className="font-semibold">Order #{payment.orderId} · {payment.direction}</p>
                <p className="text-xs text-muted-foreground">Ref {payment.transactionRefNo} · {payment.paymentMethod}</p>
                <p className="text-xs text-muted-foreground">{new Date(payment.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold">₹{Number(payment.amount).toFixed(2)}</p>
              <p className={`text-xs font-semibold ${payment.paymentStatus === 'SUCCESS' ? 'text-emerald-700' : payment.paymentStatus === 'FAILED' ? 'text-red-700' : 'text-amber-700'}`}>
                {payment.paymentStatus === 'PENDING' ? 'Pending admin verification' : payment.paymentStatus}
              </p>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold">Your orders</h2>
      <div className="mt-3 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
        ) : orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <p className="font-bold">Order #{order.id} · {order.orderStatus}</p>
                <p className="text-sm text-muted-foreground">{order.items.map((item) => `${item.title} × ${item.quantity}`).join(', ')}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-bold">₹{Number(order.totalAmount).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Payment {order.paymentStatus}</p>
              </div>
            </div>
            {order.paymentStatus === 'PENDING' && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void cancelOrder(order.id)}>
                Cancel pending order
              </Button>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
