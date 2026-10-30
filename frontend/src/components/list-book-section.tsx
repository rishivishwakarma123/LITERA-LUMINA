'use client'

import { useState } from 'react'
import { CheckCircle2, ImagePlus, ScanBarcode, ShieldCheck, Wallet } from 'lucide-react'
import { Button } from '../components/ui/button'
import { CATEGORIES } from '../lib/books'

const PERKS = [
  { icon: ScanBarcode, title: 'Scan & auto-fill', text: 'Scan the ISBN to fetch title, author and MRP instantly.' },
  { icon: Wallet, title: 'Zero commission', text: 'Keep 100% of your selling price. No hidden fees.' },
  { icon: ShieldCheck, title: 'Direct Trade', text: 'Connect directly with buyers looking for pre-owned books.' },
]

const inputClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-ring/20'

// 1. 👇 Props interface define kiya taaki App.tsx se onPublish function receive ho sake
interface ListBookSectionProps {
  onPublish?: (bookData: {
    title: string;
    author: string;
    description: string;
    category: string;
    condition: string;
    coverImage: File | null;
    originalPrice: number;
    sellingPrice: number;
    quantity: number;
  }) => void | Promise<void>;
}

export function ListBookSection({ onPublish }: ListBookSectionProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 2. 👇 Form input fields ke liye local states add kiye
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('Like New')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [originalPrice, setOriginalPrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [quantity, setQuantity] = useState('1')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    const bookData = {
      title,
      author,
      description,
      category,
      condition,
      coverImage,
      originalPrice: Number(originalPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      quantity: Number(quantity) || 1,
    }

    try {
      await onPublish?.(bookData)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to publish listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="list-book" className="scroll-mt-20 bg-secondary/60 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Sell in 60 seconds</p>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cleared your exam? Pass your books to the next topper.
          </h2>
          <p className="max-w-lg text-pretty leading-relaxed text-muted-foreground">
            List your used books for students nearby. Set your price, choose a meetup spot, and turn
            your old shelf into cash.
          </p>
          <ul className="flex flex-col gap-4 pt-2">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold">List a Book</h3>
            <span className="rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold text-accent">
              Free listing
            </span>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center" role="status">
              <CheckCircle2 className="size-12 text-accent" aria-hidden="true" />
              <p className="text-lg font-semibold">Your book is awaiting review</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                An administrator must approve your listing before it appears in the marketplace.
              </p>
              <Button variant="outline" className="mt-2 h-10 rounded-xl px-5" onClick={() => {
                setSubmitted(false)
                setTitle('')
                setAuthor('')
                setDescription('')
                setCategory('')
                setCoverImage(null)
                setOriginalPrice('')
                setSellingPrice('')
                setQuantity('1')
              }}>
                List another book
              </Button>
            </div>
          ) : (
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-blue-soft/60 p-5 text-center transition-colors hover:border-primary hover:bg-blue-soft"
                >
                  <span className="relative flex size-12 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                    <ScanBarcode className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-primary">Scan ISBN barcode</span>
                  <span className="text-xs text-muted-foreground">Auto-fill book details</span>
                </button>

                <div className="flex flex-col justify-center gap-2 rounded-2xl border-2 border-dashed border-accent/35 bg-emerald-soft/60 p-5 transition-colors hover:border-accent hover:bg-emerald-soft">
                  <label htmlFor="book-cover-image" className="flex items-center gap-2 text-sm font-semibold text-accent">
                    <ImagePlus className="size-5" aria-hidden="true" /> Choose cover image (optional)
                  </label>
                  <input
                    id="book-cover-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      if (file && file.size > 5 * 1024 * 1024) {
                        setSubmitError('Cover images must be 5 MB or smaller')
                        event.target.value = ''
                        setCoverImage(null)
                        return
                      }
                      if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                        setSubmitError('Choose a JPG, PNG, or WebP image')
                        event.target.value = ''
                        setCoverImage(null)
                        return
                      }
                      setSubmitError('')
                      setCoverImage(file)
                    }}
                  />
                  {coverImage && (
                    <p className="truncate text-xs text-muted-foreground">Selected: {coverImage.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG, or WebP · up to 5 MB</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="book-title" className="text-sm font-medium">
                  Book Title
                </label>
                {/* 4. 👇 Controlled input added for Title */}
                <input 
                  id="book-title" 
                  required 
                  placeholder="e.g. Indian Polity by M. Laxmikanth" 
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-author" className="text-sm font-medium">Author</label>
                  <input
                    id="book-author"
                    required
                    value={author}
                    onChange={(event) => setAuthor(event.target.value)}
                    className={inputClass}
                    placeholder="Author name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-quantity" className="text-sm font-medium">Available quantity</label>
                  <input
                    id="book-quantity"
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="book-description" className="text-sm font-medium">Description</label>
                <textarea
                  id="book-description"
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className={`${inputClass} min-h-20 py-2`}
                  placeholder="Describe the book and its condition"
                />
              </div>

              {/* Exam Category & Book Condition */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-category" className="text-sm font-medium">
                    Exam Category
                  </label>
                  {/* 5. 👇 Controlled select added for Category */}
                  <select 
                    id="book-category" 
                    required 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="" disabled>
                      Select exam
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-condition" className="text-sm font-medium">
                    Book Condition
                  </label>
                  {/* 6. 👇 Controlled select added for Condition */}
                  <select 
                    id="book-condition" 
                    required 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="Like New">Like New (Unmarked)</option>
                    <option value="Good">Good (Minor highlights)</option>
                    <option value="Fair">Fair (Readable, worn)</option>
                  </select>
                </div>
              </div>

              {/* Original MRP & Selling Price */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="original-price" className="text-sm font-medium">
                    Original MRP
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      ₹
                    </span>
                    {/* 7. 👇 Controlled input added for Original Price */}
                    <input
                      id="original-price"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      required
                      placeholder="599"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="book-price" className="text-sm font-medium">
                    Selling Price
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      ₹
                    </span>
                    {/* 8. 👇 Controlled input added for Selling Price */}
                    <input
                      id="book-price"
                      type="number"
                      min={1}
                      inputMode="numeric"
                      required
                      placeholder="299"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90"
              >
                {isSubmitting ? 'Submitting…' : 'Submit for Approval'}
              </Button>
              {submitError && <p className="text-sm text-destructive" role="alert">{submitError}</p>}
              <p className="text-center text-xs text-muted-foreground">
                By listing, you agree to meet only at public, verified spots.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}