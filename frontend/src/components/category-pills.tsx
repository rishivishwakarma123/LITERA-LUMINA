'use client'

// import { cn } from '@/lib/utils'
// import { CATEGORIES } from '@/lib/books'

import { cn } from '../lib/utils'
import { CATEGORIES } from '../lib/books'

type CategoryPillsProps = {
  active: string
  onChange: (value: string) => void
}

export function CategoryPills({ active, onChange }: CategoryPillsProps) {
  const options = ['All', ...CATEGORIES]

  return (
    <div
      role="group"
      aria-label="Filter by exam category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {options.map((cat) => {
        const isActive = active === cat
        return (
          <button
            key={cat}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(cat)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary',
            )}
          >
            {cat === 'All' ? 'All Books' : cat}
          </button>
        )
      })}
    </div>
  )
}
