const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080'

type ApiErrorPayload = {
  detail?: string
  message?: string
  error?: string
}

async function getCsrfToken(): Promise<{ headerName: string; token: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Unable to initialize secure session')
  }
  return response.json() as Promise<{ headerName: string; token: string }>
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    const csrf = await getCsrfToken()
    headers.set(csrf.headerName, csrf.token)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers,
    credentials: 'include',
  })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const payload = (await response.json()) as ApiErrorPayload
      message = payload.detail ?? payload.message ?? payload.error ?? message
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export async function uploadBookCover(file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<{ imageUrl: string }>('/api/uploads/book-covers', {
    method: 'POST',
    body: formData,
  })
}

export type ApiUser = {
  id: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}
