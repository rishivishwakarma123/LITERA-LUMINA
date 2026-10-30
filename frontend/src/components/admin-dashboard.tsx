import { useState } from 'react';
import { Shield, Users, BookOpen, ShoppingBag, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface AdminDashboardProps {
  users: Array<{ id: string; name: string; email: string; role: string; joinedDate: string }>;
  listings: Array<{
    id: string
    title: string
    sellerName?: string
    category?: string
    condition?: string
    sellingPrice: number
    originalPrice?: number
    status: string
  }>;
  orders: Array<{
    id: number
    buyerName: string
    totalAmount: number
    orderStatus: string
    paymentStatus: string
    items: Array<{ title: string }>
  }>;
  payments: Array<{
    id: number
    orderId: number
    payerName: string
    transactionRefNo: string
    amount: number
    paymentStatus: string
    timestamp: string
  }>;
  pendingCount: number;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUpdatePaymentStatus: (id: number, status: 'SUCCESS' | 'FAILED') => void;
  onUpdateOrderStatus: (id: number, status: 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => void;
  onBackToMarketplace: () => void;
}

export function AdminDashboard({
  users,
  listings,
  orders,
  payments,
  pendingCount,
  onApprove,
  onReject,
  onUpdatePaymentStatus,
  onUpdateOrderStatus,
  onBackToMarketplace
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'orders' | 'payments'>('pending');

  const pendingListings = listings.filter(b => b.status === 'Pending Admin Review');

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Shield className="size-4" />
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900">Admin Control Center</h1>
            </div>
            <p className="text-sm text-slate-500">Manage user accounts, verify book listings, and oversee marketplace transactions.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={onBackToMarketplace}
            className="rounded-xl border-slate-200 text-slate-700 gap-2 self-start"
          >
            <ArrowLeft className="size-4" /> Back to Marketplace
          </Button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <BookOpen className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Users</p>
                <p className="text-2xl font-black text-slate-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShoppingBag className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Orders</p>
                <p className="text-2xl font-black text-slate-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending Book Approvals ({pendingListings.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            User Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Orders & Transactions ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Payment Review ({payments.filter((payment) => payment.paymentStatus === 'PENDING').length})
          </button>
        </div>

        {/* Tab 1: Pending Approvals */}
        {activeTab === 'pending' && (
          <div className="flex flex-col gap-4">
            {pendingListings.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                <CheckCircle className="size-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">All caught up!</h3>
                <p className="text-xs text-slate-500">There are no pending book listings waiting for admin verification.</p>
              </div>
            ) : (
              pendingListings.map((book) => (
                <div key={book.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{book.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Seller: <span className="font-semibold text-slate-700">{book.sellerName || 'Rishi Vishwakarma'}</span> | Category: {book.category} | Condition: {book.condition}
                    </p>
                    <p className="text-sm font-extrabold text-emerald-600 mt-2">₹{book.sellingPrice} <span className="text-xs text-slate-400 line-through">₹{book.originalPrice}</span></p>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Button 
                      onClick={() => onApprove(book.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5 h-10 px-4"
                    >
                      <CheckCircle className="size-4" /> Approve
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => onReject(book.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs gap-1.5 h-10 px-4"
                    >
                      <XCircle className="size-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold text-slate-500 uppercase">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{u.role}</span></td>
                    <td className="p-4 text-slate-500">{u.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Orders & Transactions */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-4">
            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                <ShoppingBag className="size-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
                <p className="text-xs text-slate-500">Buyer transactions will appear here once purchases are made.</p>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <h4 className="font-bold text-slate-900">{ord.items[0]?.title ?? `Order #${ord.id}`}</h4>
                    <p className="text-xs text-slate-500">Buyer: <span className="font-semibold text-slate-700">{ord.buyerName}</span></p>
                    <p className="text-sm font-bold text-emerald-600 mt-1">₹{Number(ord.totalAmount).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
                      {ord.orderStatus} · Payment {ord.paymentStatus}
                    </span>
                    {ord.paymentStatus === 'SUCCESS' && ord.orderStatus === 'PLACED' && (
                      <Button size="sm" onClick={() => onUpdateOrderStatus(ord.id, 'SHIPPED')}>Mark shipped</Button>
                    )}
                    {ord.orderStatus === 'SHIPPED' && (
                      <Button size="sm" onClick={() => onUpdateOrderStatus(ord.id, 'DELIVERED')}>Mark delivered</Button>
                    )}
                    {ord.paymentStatus === 'PENDING' && (
                      <Button size="sm" variant="outline" onClick={() => onUpdateOrderStatus(ord.id, 'CANCELLED')}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="flex flex-col gap-4">
            {payments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                <ShoppingBag className="size-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No payment references submitted</h3>
              </div>
            ) : payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-900">Order #{payment.orderId} · {payment.payerName}</p>
                  <p className="text-xs text-slate-500">UPI reference: {payment.transactionRefNo}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-600">₹{Number(payment.amount).toFixed(2)} · {payment.paymentStatus}</p>
                </div>
                {payment.paymentStatus === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onUpdatePaymentStatus(payment.id, 'SUCCESS')}>Verify payment</Button>
                    <Button size="sm" variant="outline" onClick={() => onUpdatePaymentStatus(payment.id, 'FAILED')}>Reject reference</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}