'use client'

import { useState } from 'react'
import { X, Menu, Plus, User, LogOut, ShoppingCart, BookMarked, ReceiptText } from 'lucide-react'
import { Button } from '../components/ui/button'

const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'Explore', href: '#explore' },
  { label: 'Rent Books', href: '#explore' },
]

type SiteNavbarProps = {
  cartCount?: number
  onCartClick?: () => void
  isLoggedIn?: boolean
  userName?: string
  onLoginClick?: () => void
  onLogoutClick?: () => void
  onMyListingsClick?: () => void
  onPaymentHistoryClick?: () => void
}

export function SiteNavbar({ 
  cartCount = 0, 
  onCartClick,
  isLoggedIn = false,
  userName = '',
  onLoginClick,
  onLogoutClick,
  onMyListingsClick,
  onPaymentHistoryClick
}: SiteNavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <a href="#top" className="flex items-center gap-2.5" aria-label="Litera Lumina home">
            <img 
              src="/logo.jpeg" 
              alt="Litera Lumina Logo" 
              className="h-10 w-auto rounded-lg object-contain" 
            />
            <span className="text-lg font-bold tracking-tight text-foreground">
              Litera<span className="text-accent">Lumina</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link, i) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-current={i === 0 ? 'page' : undefined}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground aria-[current=page]:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
            
            {/* 👈 Desktop "My Listings" Nav Link */}
            {isLoggedIn && (
              <li>
                <button
                  onClick={onMyListingsClick}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground flex items-center gap-1.5"
                >
                  <BookMarked className="size-4 text-emerald-600" />
                  My Listings
                </button>
              </li>
            )}
            {isLoggedIn && (
              <li>
                <button
                  onClick={onPaymentHistoryClick}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <ReceiptText className="size-4" />
                  Payment history
                </button>
              </li>
            )}
          </ul>

          {/* Right Actions (Login + Post Book + Mobile Menu Toggle) */}
          <div className="flex items-center gap-2">
            {/* Desktop Login / Logout Button */}
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogoutClick} 
                className="hidden sm:inline-flex rounded-full text-xs gap-1 h-10 px-4"
              >
                <LogOut className="size-3.5" /> Logout ({userName})
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={onLoginClick} 
                className="hidden sm:inline-flex rounded-full gap-1.5 text-sm h-10 px-4"
              >
                <User className="size-4" /> Login
              </Button>
            )}

            {/* Cart Icon with Badge & Click Event */}
            <div 
              onClick={onCartClick} 
              className="relative flex items-center justify-center p-2 rounded-full hover:bg-secondary cursor-pointer"
            >
              <ShoppingCart className="size-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </div>

            <Button
              className="hidden h-10 gap-1.5 rounded-full bg-accent px-5 text-accent-foreground hover:bg-accent/90 sm:inline-flex"
              nativeButton={false}
              render={<a href="#list-book" />}
            >
              <Plus className="size-4" aria-hidden="true" />
              Post Book
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}

              {/* 👈 Mobile "My Listings" Button */}
              {isLoggedIn && (
                <li>
                  <button
                    onClick={() => {
                      setOpen(false)
                      if (onMyListingsClick) onMyListingsClick()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <BookMarked className="size-4 text-emerald-600" />
                    My Listings
                  </button>
                </li>
              )}
              {isLoggedIn && (
                <li>
                  <button
                    onClick={() => {
                      setOpen(false)
                      onPaymentHistoryClick?.()
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <ReceiptText className="size-4" />
                    Payment history
                  </button>
                </li>
              )}

              <li className="pt-2">
                <Button
                  className="h-10 w-full gap-1.5 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                  nativeButton={false}
                  render={<a href="#list-book" onClick={() => setOpen(false)} />}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Post Book
                </Button>
              </li>
              <li className="pt-1">
                {isLoggedIn ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setOpen(false)
                      if (onLogoutClick) onLogoutClick()
                    }} 
                    className="w-full rounded-full text-xs gap-1 h-10"
                  >
                    <LogOut className="size-3.5" /> Logout ({userName})
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setOpen(false)
                      if (onLoginClick) onLoginClick()
                    }} 
                    className="w-full rounded-full gap-1.5 text-sm h-10"
                  >
                    <User className="size-4" /> Login
                  </Button>
                )}
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  )
}