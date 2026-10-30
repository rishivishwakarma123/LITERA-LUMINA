'use client'

import { useState } from 'react'
import { X, Mail, Lock, User as UserIcon, BookOpen } from 'lucide-react'
import { Button } from './ui/button'
import { apiRequest, type ApiUser } from '../lib/api'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: ApiUser) => void
  isAdminLogin?: boolean
}

export function AuthModal({ isOpen, onClose, onLoginSuccess, isAdminLogin = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (isSignUp) {
        await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), email: identifier.trim(), phone: phone.trim(), password }),
        })
      }
      const user = await apiRequest<ApiUser>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      })
      if (isAdminLogin && user.role !== 'ADMIN') {
        await apiRequest('/api/auth/logout', { method: 'POST' })
        throw new Error('This account does not have administrator access.')
      }
      onLoginSuccess(user)
      setName('')
      setPhone('')
      setIdentifier('')
      setPassword('')
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Sign in failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-primary/10">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isSignUp ? 'Join Litera Lumina student network' : 'Login to your account'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary transition-all">
                <UserIcon className="mr-2.5 size-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          )}

          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Phone (optional)</label>
              <input
                type="tel"
                maxLength={30}
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">
              {isAdminLogin ? 'Admin username' : 'Email Address'}
            </label>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary transition-all">
              <Mail className="mr-2.5 size-4 text-muted-foreground shrink-0" />
              <input
                type={isAdminLogin ? 'text' : 'email'}
                required
                placeholder={isAdminLogin ? 'rishi' : 'student@college.edu'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <div className="flex items-center rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary transition-all">
              <Lock className="mr-2.5 size-4 text-muted-foreground shrink-0" />
              <input
                type="password"
                required
                minLength={isSignUp ? 8 : undefined}
                maxLength={72}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder={isSignUp ? 'At least 8 characters' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {isSignUp && (
              <p className="text-xs text-muted-foreground">Use 8–72 characters for your password.</p>
            )}
          </div>

          <Button type="submit" className="mt-2 h-11 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
            {isSubmitting ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </form>

        {!isAdminLogin && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setError('')
                setIsSignUp(!isSignUp)
              }}
              className="font-semibold text-primary hover:underline underline-offset-2"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}