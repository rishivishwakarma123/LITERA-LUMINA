export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 text-foreground">
          <img
            src="/logo.jpeg"
            alt=""
            aria-hidden="true"
            className="size-9 rounded-lg object-contain"
          />
          <span className="font-bold">
            Litera<span className="text-accent"> Lumina</span>
          </span>
        </div>
        <p>Books on your fingertips.</p>
      </div>
    </footer>
  )
}
