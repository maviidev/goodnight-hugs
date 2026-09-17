import { ClipboardList, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { signOut } from '../lib/supabase-rest'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  async function exit() { await signOut(); window.location.assign('/admin') }
  return <div className="admin-root"><header className="admin-header"><a className="admin-brand" href="/admin"><span className="admin-mark"><b>X</b>C</span><span><strong>XCONSULTORIA</strong><small>Painel administrativo</small></span></a><div className="admin-header-actions"><span><ShieldCheck size={15} /> Acesso protegido</span><a href="/admin/alterar-senha"><KeyRound size={17} /> Alterar senha</a><button onClick={exit}><LogOut size={17} /> Sair</button></div></header><div className="admin-body"><aside><a href="/admin" className="active"><ClipboardList size={19} /> Avaliações</a><a href="/admin/alterar-senha"><KeyRound size={19} /> Alterar senha</a></aside><main>{children}</main></div></div>
}
