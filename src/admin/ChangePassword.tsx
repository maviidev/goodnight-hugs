import { useState } from 'react'
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { updatePassword } from '../lib/supabase-rest'

export function ChangePassword() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setSuccess(false)
    if (password !== confirmation) { setError('As senhas informadas não são iguais.'); return }
    setBusy(true)
    try { await updatePassword(password); setPassword(''); setConfirmation(''); setSuccess(true) }
    catch (message) { setError(message instanceof Error ? message.message : 'Não foi possível alterar a senha.') }
    finally { setBusy(false) }
  }
  return <><a href="/admin" className="back-link"><ArrowLeft size={17} /> Voltar ao painel</a><section className="password-card"><span className="admin-kicker"><KeyRound size={15} /> Segurança da conta</span><h1>Alterar senha</h1><p>Crie uma senha exclusiva com pelo menos 12 caracteres.</p>{error && <div className="admin-alert danger">{error}</div>}{success && <div className="admin-alert success"><CheckCircle2 size={17} /> Senha alterada com sucesso.</div>}<form onSubmit={submit}><label>Nova senha<input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={12} required autoComplete="new-password" /></label><label>Confirmar nova senha<input type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} minLength={12} required autoComplete="new-password" /></label><button className="admin-primary" disabled={busy}>{busy ? 'Alterando...' : 'Salvar nova senha'}</button></form></section></>
}
