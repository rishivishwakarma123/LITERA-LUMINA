'use client'

import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { HeroSection } from '../components/hero-section'
import { CategoryPills } from '../components/category-pills'
import { BookCard } from '../components/book-card'
import { Button } from '../components/ui/button'
import { CATEGORIES, CITIES, type Book, type Category } from '../lib/books'

type MarketplaceRecord = {
  id?: string | number
  title?: string
  author?: string
  category?: string
  city?: string
  distanceKm?: number
  sellingPrice?: number
  price?: number
  originalPrice?: number
  conditionDetails?: string
  condition?: string
  conditionLevel?: string
  sellerName?: string
  seller?: string
  imageUrl?: string
  image?: string
  quantity?: number
  availableQuantity?: number
}

type MarketplaceProps = {
  books?: MarketplaceRecord[]
  onAddToCart: (book: { id: string; title: string; price: number; author?: string }) => void
  onBuyNow?: (book: { id: string; title: string; price: number; author?: string }) => void
}

export function Marketplace({ books = [], onAddToCart, onBuyNow }: MarketplaceProps) {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('All')
  const [category, setCategory] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  // Combine static default books with dynamic admin-approved books from App.tsx
  const allAvailableBooks = useMemo<Book[]>(() => {
    // Map dynamic books to match the exact 'Book' type definition from lib/books.ts
    const formattedDynamicBooks: Book[] = books
      .filter((book): book is MarketplaceRecord & { id: string | number } => book.id !== undefined)
      .map((b) => ({
      id: String(b.id),
      title: String(b.title || 'Untitled Book'),
      author: String(b.author || 'Standard Edition'),
      category: CATEGORIES.some((item) => item === b.category) ? b.category as Category : 'NCERT',
      city: b.city && CITIES.includes(b.city as (typeof CITIES)[number])
        ? b.city as (typeof CITIES)[number]
        : 'Prayagraj',
      distanceKm: Number(b.distanceKm ?? 2.5),
      sellingPrice: Number(b.sellingPrice ?? b.price ?? 0),
      originalPrice: Number(b.originalPrice ?? b.sellingPrice ?? b.price ?? 0),
      condition: String(b.conditionDetails || b.condition || 'Good'),
      conditionLevel: b.conditionLevel === 'Like New' || b.conditionLevel === 'Fair'
        ? b.conditionLevel : 'Good',
      seller: String(b.sellerName || b.seller || 'Verified Student'),
      imageUrl: String(b.imageUrl || b.image || ''),
      quantity: Number(b.availableQuantity ?? b.quantity ?? 0),
    }))

    return formattedDynamicBooks
  }, [books])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allAvailableBooks
      .filter((b) => {
        if (category !== 'All' && b.category !== category) return false
        if (city !== 'All' && b.city !== city) return false
        if (minPrice !== '' && b.sellingPrice < Number(minPrice)) return false
        if (maxPrice !== '' && b.sellingPrice > Number(maxPrice)) return false
        if (inStockOnly && (b.quantity ?? 0) <= 0) return false
        if (!q) return true
        return [b.title, b.author, b.category, b.seller].some(
          (f) => f && f.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
  }, [allAvailableBooks, query, city, category, minPrice, maxPrice, inStockOnly])

  const reset = () => {
    setQuery('')
    setCity('All')
    setCategory('All')
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

  return (
    <>
      <HeroSection query={query} onQueryChange={setQuery} city={city} onCityChange={setCity} />

      <section id="explore" aria-labelledby="near-you-heading" className="scroll-mt-20 py-14 md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-accent">Marketplace</p>
              <h2 id="near-you-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Second-Hand Books Near You
              </h2>
              <p className="mt-2 text-muted-foreground">
                Buy verified pre-owned books. {results.length} {results.length === 1 ? 'listing' : 'listings'}
                {city !== 'All' ? ` in ${city}` : ' across cities'}, sorted by distance
              </p>
            </div>
          </div>

          <CategoryPills active={category} onChange={setCategory} />

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Minimum price
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                className="h-10 w-32 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
              Maximum price
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="h-10 w-32 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              />
            </label>
            <label className="flex h-10 items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(event) => setInStockOnly(event.target.checked)}
              />
              In stock
            </label>
          </div>

          {results.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((book) => (
                <li key={book.id}>
                  <BookCard 
                    book={book} 
                    onAddToCart={() => onAddToCart({ id: book.id, title: book.title, author: book.author, price: book.sellingPrice })}
                    onBuyNow={() => {
                      const bookData = { id: book.id, title: book.title, author: book.author, price: book.sellingPrice }
                      if (onBuyNow) {
                        onBuyNow(bookData) 
                      }
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
              <p className="text-lg font-semibold">No books match your filters</p>
              <p className="text-sm text-muted-foreground">Try a different city, exam, or search term.</p>
              <Button variant="outline" className="mt-2 h-10 rounded-xl px-5" onClick={reset}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}