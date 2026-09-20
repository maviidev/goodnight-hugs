import { SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config'

export type SupabaseSession = {
  access_token: string
  refresh_token: string
  expires_at?: number
  user: { id: string; email?: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }
}

const SESSION_KEY = 'xc-admin-session-v1'
const url = (import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL) as string | undefined
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY) as string | undefined

export function isSupabaseConfigured() { return Boolean(url && anonKey) }

function config() {
  if (!url || !anonKey) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.')
  return { url: url.replace(/\/$/, ''), anonKey }
}

export function getSession(): SupabaseSession | null {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as SupabaseSession | null } catch { return null }
}

function saveSession(session: SupabaseSession | null) {
  if (typeof window === 'undefined') return
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

export async function signIn(email: string, password: string) {
  const { url: base, anonKey: key } = config()
  const response = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error_description || payload.msg || 'Não foi possível entrar.')
  const session: SupabaseSession = { ...payload, expires_at: Math.floor(Date.now() / 1000) + payload.expires_in }
  saveSession(session)
  return session
}

export async function signOut() {
  const session = getSession()
  if (session && url && anonKey) await fetch(`${url}/auth/v1/logout`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${session.access_token}` } }).catch(() => undefined)
  saveSession(null)
}

export async function updatePassword(password: string) {
  if (password.length < 12) throw new Error('A nova senha deve possuir pelo menos 12 caracteres.')
  await authenticatedFetch('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password }) })
}

async function authenticatedFetch(path: string, init?: RequestInit) {
  const { url: base, anonKey: key } = config()
  const session = getSession()
  if (!session) throw new Error('Sessão não encontrada. Entre novamente.')
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...init?.headers },
  })
  if (response.status === 401) saveSession(null)
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message || payload.msg || `Falha na consulta (${response.status}).`)
  }
  return response
}

export async function getCurrentUser() {
  return authenticatedFetch('/auth/v1/user').then(response => response.json()) as Promise<SupabaseSession['user']>
}

export async function callAuthenticatedRpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const response = await authenticatedFetch(`/rest/v1/rpc/${encodeURIComponent(name)}`, {
    method: 'POST', body: JSON.stringify(body), headers: { Accept: 'application/json' },
  })
  return response.json() as Promise<T>
}

export async function selectRows(table: string, query = 'select=*') {
  const response = await authenticatedFetch(`/rest/v1/${table}?${query}`, { headers: { Accept: 'application/json' } })
  return response.json() as Promise<Record<string, unknown>[]>
}

export async function createSignedPhotoUrl(bucket: string, path: string) {
  const response = await authenticatedFetch(`/storage/v1/object/sign/${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'POST', body: JSON.stringify({ expiresIn: 900 }),
  })
  const payload = await response.json() as { signedURL?: string; signedUrl?: string }
  const signed = payload.signedURL || payload.signedUrl
  if (!signed) throw new Error('Não foi possível gerar o acesso temporário à foto.')
  if (signed.startsWith('http')) return signed
  return `${config().url}/storage/v1${signed.startsWith('/') ? '' : '/'}${signed}`
}

export async function requireStaff() {
  const user = await getCurrentUser()
  const claimRole = String(user.app_metadata?.role || user.app_metadata?.user_role || '').toLowerCase()
  let profileRole = ''
  try {
    const rows = await selectRows('profiles', `select=*&id=eq.${encodeURIComponent(user.id)}&limit=1`)
    profileRole = String(rows[0]?.role || rows[0]?.user_role || rows[0]?.type || '').toLowerCase()
  } catch { /* RLS remains the source of truth for protected data. */ }
  const role = claimRole || profileRole
  const isInitialAdmin = user.id === 'eb84c124-f09c-4d28-a0a0-b75af9e50d56'
  if (!isInitialAdmin && !['admin', 'trainer', 'treinador'].includes(role)) throw new Error('Acesso permitido somente para treinador ou administrador.')
  return { user, role: isInitialAdmin ? 'admin' : role }
}
