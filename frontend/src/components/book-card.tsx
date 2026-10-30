'use client'

import { ShoppingCart, Zap, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import type { Book } from '../lib/books'

const COVER_STYLES: Record<Book['category'], string> = {
  UPSC: 'from-[oklch(0.42_0.15_258)] to-[oklch(0.3_0.12_262)]',
  JEE: 'from-[oklch(0.5_0.13_220)] to-[oklch(0.36_0.11_235)]',
  NEET: 'from-[oklch(0.58_0.13_162)] to-[oklch(0.42_0.11_168)]',
  GATE: 'from-[oklch(0.4_0.08_250)] to-[oklch(0.27_0.05_255)]',
  NCERT: 'from-[oklch(0.62_0.12_175)] to-[oklch(0.46_0.12_200)]',
  'Class 12': 'from-[oklch(0.52_0.15_250)] to-[oklch(0.45_0.12_190)]',
}

const CONDITION_STYLES: Record<Book['conditionLevel'], string> = {
  'Like New': 'bg-emerald-soft text-accent',
  Good: 'bg-blue-soft text-primary',
  Fair: 'bg-muted text-muted-foreground',
}

type BookCardProps = {
  book: Book
  onAddToCart?: () => void
  onBuyNow?: () => void // 👈 1. Yahan onBuyNow add kar diya
}

export function BookCard({ book, onAddToCart, onBuyNow }: BookCardProps) { // 👈 2. Yahan destructure kiya
  const discount = Math.round((1 - book.sellingPrice / book.originalPrice) * 100)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div
        className={cn(
          'relative flex h-40 items-end bg-gradient-to-br p-5 text-primary-foreground overflow-hidden',
          COVER_STYLES[book.category],
        )}
      >
        {/* Book Cover Image Support */}
        {book.imageUrl && (
          <img
            src={book.imageUrl}
            alt={book.title}
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-overlay"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-4 w-1.5 rounded-full bg-white/15"
        />
        <div className="relative pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/75">
            {book.author}
          </p>
          <p className="line-clamp-2 text-lg font-bold leading-snug">{book.title}</p>
        </div>
        <span className="absolute right-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-accent shadow-sm">
          {discount}% off
        </span>
        <span className="absolute left-4 top-4 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-md text-white">
          Second-Hand
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{book.title}</h3>
            <p className="truncate text-sm text-muted-foreground">by {book.author}</p>
          </div>
          <span className="shrink-0 rounded-md border border-primary/20 bg-blue-soft px-2 py-0.5 text-xs font-semibold text-primary">
            {book.category}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">₹{book.sellingPrice}</span>
          <span className="text-sm text-muted-foreground line-through">
            <span className="sr-only">Original price </span>₹{book.originalPrice}
          </span>
        </div>
        {book.quantity !== undefined && (
          <p className="text-xs font-medium text-muted-foreground">
            {book.quantity} {book.quantity === 1 ? 'copy' : 'copies'} in stock
          </p>
        )}

        <div className="flex flex-col gap-2 text-sm">
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <span>
              <span
                className={cn(
                  'mr-1.5 rounded px-1.5 py-0.5 text-xs font-semibold',
                  CONDITION_STYLES[book.conditionLevel],
                )}
              >
                {book.conditionLevel}
              </span>
              <span className="text-muted-foreground">{book.condition}</span>
            </span>
          </p>
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onAddToCart}
            className="h-11 rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-semibold text-sm"
          >
            <ShoppingCart className="size-4 mr-1.5" />
            Add to Cart
          </Button>
          <Button
            onClick={onBuyNow} // 👈 3. Yahan onClick pass kar diya
            className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm"
          >
            <Zap className="size-4 mr-1.5" />
            Buy Now
          </Button>
        </div>
      </div>
    </article>
  )
}