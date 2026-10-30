import { useCallback, useEffect, useState } from 'react'
import { SiteNavbar } from './components/site-navbar'
import { Marketplace } from './components/marketplace'
import { ListBookSection } from './components/list-book-section'
import { SiteFooter } from './components/site-footer'
import { CartPage } from './components/cart-page'
import { CheckoutModal } from './components/checkout-modal'
import { AuthModal } from './components/AuthModal'
import { SellerDashboard } from './components/seller-dashboard'
import { AdminDashboard } from './components/admin-dashboard'
import { PaymentHistory } from './components/payment-history'
import type { CheckoutCartItem, CheckoutOrder } from './components/checkout-modal'
import { apiRequest, uploadBookCover, type ApiUser } from './lib/api'

type BookRecord = {
  id: number | string
  title: string
  author?: string
  description?: string
  price?: number
  sellingPrice?: number
  originalPrice?: number
  quantity?: number
  availableQuantity?: number
  category?: string
  imageUrl?: string
  conditionLevel?: string
  conditionDetails?: string
  sellerName?: string
  sellerEmail?: string
  status?: string
  createdAt?: string
}

type Listing = BookRecord & {
  id: string
  sellingPrice: number
  status: string
  condition: string
}

type CartItem = CheckoutCartItem
type View = 'marketplace' | 'cart' | 'checkout' | 'seller-dashboard' | 'admin-portal' | 'payments'

function toListing(book: BookRecord): Listing {
  const statuses: Record<string, string> = {
    PENDING: 'Pending Admin Review',
    APPROVED: 'Live on Marketplace',
    REJECTED: 'Rejected',
    SOLD_OUT: 'Sold Out',
  }
  return {
    ...book,
    id: String(book.id),
    quantity: Number(book.availableQuantity ?? book.quantity ?? 0),
    sellingPrice: Number(book.sellingPrice ?? book.price ?? 0),
    condition: book.conditionDetails ?? book.conditionLevel ?? 'Good',
    status: statuses[book.status ?? ''] ?? book.status ?? 'Pending Admin Review',
  }
}

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentView, setCurrentView] = useState<View>('marketplace')
  const [adminRouteRequested] = useState(() => window.location.pathname.startsWith('/admin'))
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [adminLogin, setAdminLogin] = useState(false)
  const [postLoginRedirect, setPostLoginRedirect] = useState<View | null>(null)
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [marketplaceListings, setMarketplaceListings] = useState<Listing[]>([])
  const [usersList, setUsersList] = useState<Array<{
    id: string
    name: string
    email: string
    role: string
    joinedDate: string
  }>>([])
  const [adminOrders, setAdminOrders] = useState<Array<{
    id: number
    buyerName: string
    totalAmount: number
    orderStatus: string
    paymentStatus: string
    items: Array<{ title: string }>
  }>>([])
  const [adminPayments, setAdminPayments] = useState<Array<{
    id: number
    orderId: number
    payerName: string
    transactionRefNo: string
    amount: number
    paymentStatus: string
    timestamp: string
  }>>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingCartBook, setPendingCartBook] = useState<Omit<CartItem, 'id' | 'quantity' | 'availableQuantity'> | null>(null)
  const [paymentNotice, setPaymentNotice] = useState('')
  const [uiError, setUiError] = useState('')

  const refreshMarketplace = useCallback(async () => {
    const books = await apiRequest<BookRecord[]>('/api/books')
    return books.map(toListing)
  }, [])

  const refreshCart = useCallback(async () => {
    const items = await apiRequest<CartItem[]>('/api/cart')
    setCart(items.map((item) => ({ ...item, id: String(item.id) })))
  }, [])

  const refreshSellerListings = useCallback(async (user: ApiUser) => {
    if (user.role === 'ADMIN') {
      const [approved, pending, orders, payments] = await Promise.all([
        apiRequest<BookRecord[]>('/api/books'),
        apiRequest<BookRecord[]>('/api/admin/books/pending'),
        apiRequest<NonNullable<typeof adminOrders>>('/api/admin/orders'),
        apiRequest<NonNullable<typeof adminPayments>>('/api/admin/payments'),
      ])
      setUserListings([...approved, ...pending].map(toListing))
      setAdminOrders(orders)
      setAdminPayments(payments)
      setPendingCount(pending.length)
      const users = await apiRequest<Array<{
        id: number
        name: string
        email: string
        role: string
        createdAt?: string
      }>>('/api/admin/users')
      setUsersList(users.map((item) => ({
        id: String(item.id),
        name: item.name,
        email: item.email,
        role: item.role,
        joinedDate: item.createdAt?.slice(0, 10) ?? '',
      })))
      return
    }

    const books = await apiRequest<BookRecord[]>('/api/books/seller/mine')
    setUserListings(books.map(toListing))
  }, [])

  useEffect(() => {
    void refreshMarketplace()
      .then(setMarketplaceListings)
      .catch((error: unknown) => setUiError(error instanceof Error ? error.message : 'Unable to load books'))

    void apiRequest<ApiUser>('/api/auth/me')
      .then((user) => {
        setCurrentUser(user)
        if (adminRouteRequested && user.role === 'ADMIN') {
          setCurrentView('admin-portal')
        } else if (adminRouteRequested) {
          setUiError('Administrator access is required for this page.')
          window.history.replaceState(null, '', '/')
        }
        void refreshSellerListings(user).catch((error: unknown) => {
          setUiError(error instanceof Error ? error.message : 'Unable to load your account data')
        })
        void refreshCart().catch((error: unknown) => {
          setUiError(error instanceof Error ? error.message : 'Unable to load your cart')
        })
      })
      .catch((error: unknown) => {
        if (adminRouteRequested && error instanceof Error && error.message.includes('(401)')) {
          setPostLoginRedirect('admin-portal')
          setAdminLogin(true)
          setShowAuthModal(true)
        } else if (!(error instanceof Error) || !error.message.includes('(401)')) {
          setUiError(error instanceof Error ? error.message : 'Unable to restore your session')
        }
      })
  }, [adminRouteRequested, refreshCart, refreshMarketplace, refreshSellerListings])

  const marketplaceBooks = marketplaceListings

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') return
    const timer = window.setInterval(() => {
      void apiRequest<number>('/api/admin/books/pending/count')
        .then((count) => {
          setPendingCount(count)
          if (currentView === 'admin-portal') {
            void refreshSellerListings(currentUser)
          }
        })
        .catch((error: unknown) => {
          setUiError(error instanceof Error ? error.message : 'Unable to refresh admin notifications')
        })
    }, 15000)
    return () => window.clearInterval(timer)
  }, [currentUser, currentView, refreshSellerListings])

  const promptForLogin = (redirect: View, book?: Omit<CartItem, 'id' | 'quantity' | 'availableQuantity'>) => {
    setPendingCartBook(book ?? null)
    setPostLoginRedirect(redirect)
    setAdminLogin(false)
    setShowAuthModal(true)
  }

  const addBookToCart = async (book: Omit<CartItem, 'id' | 'quantity' | 'availableQuantity'>) => {
    await apiRequest<CartItem>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId: book.productId, quantity: 1 }),
    })
    await refreshCart()
  }

  const handleAddToCart = async (book: { id: string; title: string; price: number; author?: string }) => {
    const cartBook = { productId: Number(book.id), title: book.title, author: book.author, price: book.price }
    if (!currentUser) {
      promptForLogin('cart', cartBook)
      return
    }
    try {
      await addBookToCart(cartBook)
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to add this book to your cart')
    }
  }

  const handleBuyNow = async (book: { id: string; title: string; price: number; author?: string }) => {
    const cartBook = { productId: Number(book.id), title: book.title, author: book.author, price: book.price }
    if (!currentUser) {
      promptForLogin('checkout', cartBook)
      return
    }
    try {
      await addBookToCart(cartBook)
      setCurrentView('checkout')
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to start checkout')
    }
  }

  const handleLoginSuccess = async (user: ApiUser) => {
    setCurrentUser(user)
    setUiError('')
    try {
      await refreshCart()
      if (pendingCartBook) {
        await addBookToCart(pendingCartBook)
      }
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to load your cart')
    }
    setPendingCartBook(null)
    if (postLoginRedirect) {
      setCurrentView(postLoginRedirect)
    }
    setPostLoginRedirect(null)
    void refreshSellerListings(user).catch((error: unknown) => {
      setUiError(error instanceof Error ? error.message : 'Unable to load account data')
    })
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
      setCurrentUser(null)
      setCart([])
      setCurrentView('marketplace')
      setMarketplaceListings(await refreshMarketplace())
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to sign out')
    }
  }

  const handlePublishListing = async (bookData: {
    title: string
    author: string
    description: string
    category: string
    condition: string
    coverImage: File | null
    originalPrice: number
    sellingPrice: number
    quantity: number
  }) => {
    if (!currentUser) {
      setAdminLogin(false)
      setShowAuthModal(true)
      throw new Error('Sign in before listing a book.')
    }
    try {
      const cover = bookData.coverImage
        ? await uploadBookCover(bookData.coverImage)
        : null
      await apiRequest<BookRecord>('/api/books', {
        method: 'POST',
        body: JSON.stringify({
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          category: bookData.category,
          price: bookData.sellingPrice,
          originalPrice: bookData.originalPrice,
          quantity: bookData.quantity,
          imageUrl: cover?.imageUrl ?? null,
          conditionLevel: bookData.condition,
          conditionDetails: bookData.condition,
        }),
      })
      setMarketplaceListings(await refreshMarketplace())
      await refreshSellerListings(currentUser)
      setCurrentView('seller-dashboard')
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to publish this listing')
      throw error
    }
  }

  const updateModeration = async (bookId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(`/api/admin/books/${bookId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      if (currentUser) {
        await refreshSellerListings(currentUser)
      }
      setMarketplaceListings(await refreshMarketplace())
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to update this listing')
    }
  }

  const openAdminPortal = () => {
    if (currentUser?.role === 'ADMIN') {
      setCurrentView('admin-portal')
      return
    }
    setPostLoginRedirect('admin-portal')
    setAdminLogin(true)
    setShowAuthModal(true)
  }

  const handleOpenMyListings = () => {
    if (!currentUser) {
      promptForLogin('seller-dashboard')
    } else {
      setCurrentView('seller-dashboard')
    }
  }

  const handleOpenPaymentHistory = () => {
    if (!currentUser) {
      promptForLogin('payments')
    } else {
      setPaymentNotice('')
      setCurrentView('payments')
    }
  }

  const updatePaymentStatus = async (paymentId: number, status: 'SUCCESS' | 'FAILED') => {
    try {
      await apiRequest(`/api/admin/payments/${paymentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      if (currentUser) await refreshSellerListings(currentUser)
      setMarketplaceListings(await refreshMarketplace())
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to verify payment')
    }
  }

  const updateOrderStatus = async (orderId: number, status: 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
    try {
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      if (currentUser) await refreshSellerListings(currentUser)
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Unable to update order')
    }
  }

  const handleOrderPlaced = async (order: CheckoutOrder) => {
    setPaymentNotice(`Order #${order.id} is awaiting payment verification. Reference: ${order.transactionRefNo}.`)
    setCurrentView('payments')
    try {
      await refreshCart()
      setUiError('')
    } catch (error) {
      setUiError(error instanceof Error ? error.message : 'Order was placed, but cart refresh failed')
    }
  }

  return (
    <div className="antialiased min-h-screen bg-white text-slate-900 font-sans">
      <SiteNavbar
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => {
          if (currentUser) setCurrentView('cart')
          else promptForLogin('cart')
        }}
        isLoggedIn={currentUser !== null}
        userName={currentUser?.name ?? ''}
        onLoginClick={() => {
          setAdminLogin(false)
          setShowAuthModal(true)
        }}
        onLogoutClick={() => void handleLogout()}
        onMyListingsClick={handleOpenMyListings}
        onPaymentHistoryClick={handleOpenPaymentHistory}
      />

      <div className="bg-slate-900 px-4 py-2 text-xs text-white flex justify-between items-center">
        <span className="font-medium">Litera Lumina Marketplace</span>
        <div className="flex gap-3">
          <button onClick={() => setCurrentView('marketplace')} className="hover:underline">
            Marketplace
          </button>
          <button onClick={openAdminPortal} className="flex items-center gap-1 hover:underline">
            Admin Control Center
            {pendingCount > 0 && currentUser?.role === 'ADMIN' && (
              <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {uiError && (
        <div className="mx-auto mt-4 max-w-7xl px-4" role="alert">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {uiError}
          </p>
        </div>
      )}

      <main>
        {currentView === 'marketplace' && (
          <>
            <Marketplace books={marketplaceBooks} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />
            <ListBookSection onPublish={handlePublishListing} />
          </>
        )}

        {currentView === 'seller-dashboard' && currentUser && (
          <SellerDashboard
            userName={currentUser.name}
            userEmail={currentUser.email}
            userListings={userListings}
            onBackToMarketplace={() => setCurrentView('marketplace')}
          />
        )}

        {currentView === 'admin-portal' && currentUser?.role === 'ADMIN' && (
          <AdminDashboard
            users={usersList}
            listings={userListings}
            orders={adminOrders}
            payments={adminPayments}
            pendingCount={pendingCount}
            onApprove={(id) => void updateModeration(id, 'APPROVED')}
            onReject={(id) => void updateModeration(id, 'REJECTED')}
            onUpdatePaymentStatus={(id, status) => void updatePaymentStatus(id, status)}
            onUpdateOrderStatus={(id, status) => void updateOrderStatus(id, status)}
            onBackToMarketplace={() => setCurrentView('marketplace')}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            cart={cart}
            onRemoveItem={(id) => {
              void apiRequest(`/api/cart/items/${id}`, { method: 'DELETE' })
                .then(refreshCart)
                .catch((error: unknown) => setUiError(error instanceof Error ? error.message : 'Unable to remove cart item'))
            }}
            onUpdateQuantity={(item, quantity) => {
              void apiRequest(`/api/cart/items/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify({ quantity }),
              })
                .then(refreshCart)
                .catch((error: unknown) => setUiError(error instanceof Error ? error.message : 'Unable to update cart quantity'))
            }}
            onBackToShop={() => setCurrentView('marketplace')}
            onProceedToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutModal
            cart={cart}
            email={currentUser?.email ?? ''}
            onBack={() => setCurrentView('cart')}
            onOrderPlaced={(order) => void handleOrderPlaced(order)}
          />
        )}

        {currentView === 'payments' && currentUser && (
          <PaymentHistory notice={paymentNotice} onBack={() => setCurrentView('marketplace')} />
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        isAdminLogin={adminLogin}
        onClose={() => {
          setShowAuthModal(false)
          setAdminLogin(false)
          setPostLoginRedirect(null)
          if (adminRouteRequested) {
            window.history.replaceState(null, '', '/')
          }
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <SiteFooter />
    </div>
  )
}
