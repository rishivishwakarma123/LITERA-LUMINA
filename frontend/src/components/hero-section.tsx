'use client'




import { MapPin, Search, ShieldCheck, Users, Leaf } from 'lucide-react'
import { Button } from '../components/ui/button'
import { CITIES } from '../lib/books'

type HeroSectionProps = {
  query: string
  onQueryChange: (value: string) => void
  city: string
  onCityChange: (value: string) => void
}

const STATS = [
  { icon: Users, label: '25k+ students', sub: 'across 40 cities' },
  { icon: ShieldCheck, label: 'Safe meetups', sub: 'verified spots' },
  { icon: Leaf, label: 'Up to 70% off', sub: 'reuse & save' },
]

export function HeroSection({ query, onQueryChange, city, onCityChange }: HeroSectionProps) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_10%_0%,var(--blue-soft),transparent),radial-gradient(40%_40%_at_90%_20%,var(--emerald-soft),transparent)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_1fr] lg:px-8">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-emerald-soft px-3 py-1 text-xs font-semibold text-accent">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Hyper-local book exchange for aspirants
          </span>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Get brand new and trusted pre-owned exam books from students and toppers near you.{' '}
            
          </h1>

          <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Buy, sell and rent UPSC, JEE, NEET and NCERT books from fellow students in your city.
            Save money, meet safely, and keep knowledge in the loop.
          </p>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5 sm:flex-row sm:items-center"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search books by exam, title, or author
            </label>
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search by exam, title or author…"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex items-center gap-2 border-t border-border px-3 pt-2 sm:border-l sm:border-t-0 sm:pt-0">
              <MapPin className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <label htmlFor="hero-city" className="sr-only">
                Filter by city
              </label>
              <select
                id="hero-city"
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                className="h-11 w-full cursor-pointer bg-transparent pr-2 text-sm font-medium outline-none sm:w-36"
              >
                <option value="All">All cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="h-11 rounded-xl px-6 text-sm font-semibold">
              Find Books
            </Button>
          </form>

          <ul className="grid grid-cols-3 gap-3 pt-2 sm:max-w-lg">
            {STATS.map(({ icon: Icon, label, sub }) => (
              <li key={label} className="flex flex-col gap-1">
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-            border shadow-2xl shadow-primary/10">
            <img
              src="/images/hero-books.png"
              alt="A stack of secondhand competitive exam books on a study desk"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="absolute -left-8 bottom-10 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl">
            <span className="flex size-10 items-center justify-center rounded-full bg-emerald-soft text-accent">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">Indian Polity · ₹299</p>
              <p className="text-xs text-muted-foreground">1.8 km away · Like New</p>
            </div>
          </div>
          <div className="absolute -right-4 top-10 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
            <p className="text-xs text-muted-foreground">You saved</p>
            <p className="text-xl font-bold text-accent">₹600</p>
          </div>
        </div>
      </div>
    </section>
  )
}
