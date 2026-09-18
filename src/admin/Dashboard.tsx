import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, ClipboardCheck, ClipboardList, Clock3, KeyRound, Search, UserRoundX } from 'lucide-react'
import { loadAssessments } from './data'
import type { AssessmentStatus, AssessmentSummary } from './types'

const statusLabel: Record<AssessmentStatus, string> = { completed: 'Concluída', in_progress: 'Em andamento', not_started: 'Não iniciada' }
const date = (value: string) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'

export function Dashboard() {
  const [items, setItems] = useState<AssessmentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | AssessmentStatus>('all')
  const [order, setOrder] = useState<'recent' | 'oldest' | 'name'>('recent')
  useEffect(() => { loadAssessments().then(setItems).catch(message => setError(message instanceof Error ? message.message : 'Falha ao carregar avaliações.')).finally(() => setLoading(false)) }, [])
  const visible = useMemo(() => items.filter(item => `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || item.status === filter)).sort((a, b) => order === 'name' ? a.name.localeCompare(b.name) : order === 'oldest' ? Date.parse(a.createdAt) - Date.parse(b.createdAt) : Date.parse(b.createdAt) - Date.parse(a.createdAt)), [items, search, filter, order])
  const count = (status: AssessmentStatus) => items.filter(item => item.status === status).length
  return <><div className="admin-title"><div><span className="admin-kicker">XCONSULTORIA</span><h1>Painel de Avaliações</h1><p>Acompanhe o preenchimento e consulte as fichas dos alunos.</p></div><a className="password-shortcut" href="/admin/alterar-senha"><KeyRound size={17} /> Alterar minha senha</a></div>
    <section className="metric-grid"><Metric icon={<ClipboardList />} label="Total de avaliações" value={items.length} tone="cyan" /><Metric icon={<ClipboardCheck />} label="Concluídas" value={count('completed')} tone="green" /><Metric icon={<Clock3 />} label="Em andamento" value={count('in_progress')} tone="pink" /><Metric icon={<UserRoundX />} label="Não iniciadas" value={count('not_started')} tone="purple" /></section>
    <section className="admin-panel"><div className="panel-heading"><div><h2>Alunos e avaliações</h2><p>{visible.length} registro(s) encontrado(s)</p></div><div className="admin-search"><Search size={18} /><input placeholder="Buscar aluno..." value={search} onChange={event => setSearch(event.target.value)} /></div></div>
      <div className="toolbar"><div className="filter-tabs">{([['all','Todos'],['completed','Concluídos'],['in_progress','Em andamento'],['not_started','Não iniciados']] as const).map(([value,label]) => <button className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div><select value={order} onChange={event => setOrder(event.target.value as typeof order)}><option value="recent">Mais recentes</option><option value="oldest">Mais antigos</option><option value="name">Nome A–Z</option></select></div>
      {error && <div className="admin-alert danger">{error}</div>}{loading ? <div className="admin-empty"><div className="admin-loader" />Carregando avaliações...</div> : visible.length === 0 ? <div className="admin-empty">Nenhuma avaliação encontrada.</div> : <div className="assessment-list">{visible.map(item => <article className="assessment-row" key={item.id}><div className="student-avatar">{item.name.slice(0,2).toUpperCase()}</div><div className="student-main"><strong>{item.name}</strong><a href={`mailto:${item.email}`}>{item.email || 'E-mail não informado'}</a></div><div className="row-data"><span>Peso atual</span><strong>{item.weight ? `${item.weight} kg` : '—'}</strong></div><div className="row-data"><span>{item.status === 'completed' ? 'Concluída em' : 'Criada em'}</span><strong><CalendarDays size={14} /> {date(item.completedAt || item.createdAt)}</strong></div><span className={`status ${item.status}`}>{statusLabel[item.status]}</span><a className="view-link" href={`/admin/avaliacoes/${item.id}`}>Ver avaliação <ArrowRight size={16} /></a></article>)}</div>}
    </section></>
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) { return <article className={`metric ${tone}`}><div>{icon}</div><span>{label}</span><strong>{value}</strong></article> }
