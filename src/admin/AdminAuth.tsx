import { useEffect, useState, type ReactNode } from 'react'
import { LockKeyhole, LogIn, ShieldCheck } from 'lucide-react'
import { getSession, isSupabaseConfigured, requireStaff, signIn } from '../lib/supabase-rest'
import '../admin.css'

export function AdminAuth({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'checking' | 'login' | 'authorized'>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!getSession()) { setState('login'); return }
    requireStaff().then(() => setState('authorized')).catch(message => { setError(message instanceof Error ? message.message : 'Acesso não autorizado.'); setState('login') })
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try { await signIn(email, password); await requireStaff(); setState('authorized') }
    catch (message) { setError(message instanceof Error ? message.message : 'Não foi possível entrar.') }
    finally { setBusy(false) }
  }

  if (state === 'authorized') return <>{children}</>
  if (state === 'checking') return <div className="admin-root admin-center"><div className="admin-loader" /><p>Validando acesso seguro...</p></div>
  return <main className="admin-root admin-center"><form className="login-card" onSubmit={submit}>
    <div className="admin-mark"><span>X</span>C</div><span className="admin-kicker"><ShieldCheck size={15} /> Área protegida</span>
    <h1>Acesso do treinador</h1><p>Entre com sua conta autorizada da XConsultoria.</p>
    {!isSupabaseConfigured() && <div className="admin-alert danger">O Supabase ainda não foi configurado neste ambiente.</div>}
    {error && <div className="admin-alert danger">{error}</div>}
    <label>E-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="seu@email.com" /></label>
    <label>Senha<div className="password-field"><LockKeyhole size={17} /><input type="password" value={password} onChange={event => setPassword(event.target.value)} required autoComplete="current-password" placeholder="••••••••" /></div></label>
    <button className="admin-primary" disabled={busy || !isSupabaseConfigured()}>{busy ? 'Entrando...' : <><LogIn size={18} /> Entrar no painel</>}</button>
    <small>O acesso depende da sessão e das políticas RLS do Supabase.</small>
  </form></main>
}
