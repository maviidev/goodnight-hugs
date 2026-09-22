import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, Dumbbell, Flag, Ruler, Scale, Target, X } from 'lucide-react'
import { loadAssessmentDetail, loadPhotoUrls, valueFrom } from './data'
import type { AnswerView, AssessmentDetail as Detail, AssessmentStatus, PhotoView } from './types'

type Tab = 'overview' | 'assessments' | 'answers' | 'photos'

const statusLabel: Record<AssessmentStatus, string> = { completed: 'Avaliação concluída', in_progress: 'Avaliação em andamento', not_started: 'Avaliação não iniciada' }
const responseSections = [
  ['DADOS PESSOAIS', ['name', 'email', 'phone', 'birthDate', 'height', 'currentWeight', 'bodyFat']],
  ['HISTÓRICO E OBJETIVOS', ['trainingTime', 'activities', 'trainingBreak', 'shortGoal', 'longGoal', 'motivation']],
  ['APETITE E METABOLISMO', ['weightDifficulty', 'appetite', 'appetiteTime']],
  ['SONO E INTESTINO', ['wakeSleep', 'daySleep', 'sleepQuality']],
  ['ALIMENTAÇÃO', ['meals', 'foodRoutine', 'restrictions', 'water']],
  ['SUPLEMENTAÇÃO', ['alcohol', 'smoking', 'caffeine', 'stimulants', 'supplements', 'supplementBrand', 'supplementBudget']],
  ['TREINAMENTO', ['currentFrequency', 'trainingAvailability', 'preferredTraining', 'dislikedExercises', 'sessionDuration']],
  ['SAÚDE E INFORMAÇÕES RELEVANTES', ['conditions', 'medications', 'injuries', 'surgeries', 'performanceSubstances', 'limitations']],
  ['COMPROMETIMENTO', ['determination', 'expectations']],
  ['INFORMAÇÕES ADICIONAIS', ['occupation', 'additionalInformation']],
] as const
const warningKeys = ['restrictions', 'conditions', 'medications', 'smoking', 'injuries', 'surgeries', 'performanceSubstances', 'limitations']

export function AssessmentDetailPage({ assessmentId }: { assessmentId: string }) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [student, setStudent] = useState<Detail | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [photosLoading, setPhotosLoading] = useState(false)
  const photoAssessmentLoaded = useRef('')
  const [error, setError] = useState('')
  const [activePhoto, setActivePhoto] = useState<number | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError('')
    loadAssessmentDetail(assessmentId).then(initial => {
      if (cancelled) return
      setStudent(initial); setDetail(initial); setLoading(false)
      const latestId = initial.history[0]?.id
      if (latestId && latestId !== initial.id) loadAssessmentDetail(latestId).then(latest => { if (!cancelled) { setStudent(latest); setDetail(latest) } }).catch(() => undefined)
    }).catch(message => { if (!cancelled) { setError(message instanceof Error ? message.message : 'Não foi possível carregar os dados deste aluno.'); setLoading(false) } })
    return () => { cancelled = true }
  }, [assessmentId, reloadKey])

  useEffect(() => {
    if (tab !== 'photos' || !detail || photoAssessmentLoaded.current === detail.id || detail.photos.every(photo => photo.url || !photo.path)) return
    let cancelled = false
    setPhotosLoading(true); photoAssessmentLoaded.current = detail.id
    loadPhotoUrls(detail.photos).then(photos => { if (!cancelled) setDetail(current => current ? { ...current, photos } : current) }).finally(() => { if (!cancelled) setPhotosLoading(false) })
    return () => { cancelled = true }
  }, [tab, detail])

  const warnings = useMemo(() => detail?.answers.filter(answer => warningKeys.includes(answer.key) && isRelevant(answer.value)) || [], [detail])

  async function selectAssessment(id: string) {
    if (detail?.id === id) return
    setLoading(true); setError(''); setActivePhoto(null); photoAssessmentLoaded.current = ''
    try { setDetail(await loadAssessmentDetail(id)) }
    catch (message) { setError(message instanceof Error ? message.message : 'Não foi possível carregar os dados deste aluno.') }
    finally { setLoading(false) }
  }

  if (error) return <><a href="/admin" className="back-link"><ArrowLeft size={17} /> Voltar para Alunos e Avaliações</a><div className="student-error"><div className="admin-alert danger">Não foi possível carregar os dados deste aluno.<small>{error}</small></div><button className="admin-primary retry-button" onClick={() => setReloadKey(key => key + 1)}>Tentar novamente</button></div></>
  if (loading || !detail || !student) return <StudentSkeleton />

  const completed = student.history.filter(item => item.status === 'completed')
  if (!completed.length) return <><a href="/admin" className="back-link"><ArrowLeft size={17} /> Voltar para Alunos e Avaliações</a><section className="detail-hero"><StudentHeading detail={student} /></section><div className="admin-empty student-no-data">Este aluno ainda não possui uma avaliação concluída.</div></>

  const firstDate = [...student.history].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0]?.createdAt
  const selectedDate = detail.completedAt || detail.createdAt
  const determination = valueFrom(detail, 'determination', 'commitment')
  const tabs: [Tab, string][] = [['overview', 'Visão geral'], ['assessments', 'Avaliações'], ['answers', 'Respostas'], ['photos', 'Fotos']]

  return <>
    <a href="/admin" className="back-link"><ArrowLeft size={17} /> Voltar para Alunos e Avaliações</a>
    <section className="detail-hero student-hero"><StudentHeading detail={student} /><div className="student-dates"><span>Aluno desde: <strong>{formatDate(firstDate)}</strong></span><span>Última avaliação: <strong>{formatDate(student.completedAt || student.createdAt)}</strong></span></div></section>
    <section className="student-summary">
      <SummaryCard icon={<Scale />} label="Peso atual" value={unit(valueFrom(student, 'currentWeight') || student.weight, 'kg')} />
      <SummaryCard icon={<Ruler />} label="Altura" value={height(valueFrom(student, 'height'))} />
      <SummaryCard icon={<CalendarDays />} label="Idade" value={age(valueFrom(student, 'birthDate', 'birth_date', 'age'))} />
      <SummaryCard icon={<Target />} label="% de gordura" value={unit(valueFrom(student, 'bodyFat', 'body_fat', 'body_fat_percentage'), '%', 'Não informado')} />
    </section>
    <section className="goal-card"><div><Flag /><span>Objetivo</span></div><p>{valueFrom(student, 'shortGoal') || 'Não informado'}</p><strong>Objetivo de longo prazo</strong><p>{valueFrom(student, 'longGoal') || 'Não informado'}</p></section>
    <nav className="student-tabs" aria-label="Seções da ficha">{tabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <div className="selected-assessment">Avaliação de <strong>{formatDate(selectedDate)}</strong>{detail.id !== student.id && <span> · histórico selecionado</span>}</div>

    {tab === 'overview' && <section className="student-overview">
      <InfoSection title="Dados físicos" icon={<Scale />} items={items(detail, [['Peso atual', ['currentWeight']], ['Altura', ['height']], ['Idade', ['birthDate', 'age']], ['% de gordura', ['bodyFat']]])} />
      <InfoSection title="Objetivos" icon={<Flag />} items={items(detail, [['Objetivo de curto prazo', ['shortGoal']], ['Objetivo de longo prazo', ['longGoal']]])} />
      <InfoSection title="Treinamento" icon={<Dumbbell />} items={items(detail, [['Dias disponíveis para treino', ['trainingAvailability']], ['Frequência atual', ['currentFrequency']], ['Tempo disponível na academia', ['sessionDuration']], ['Outras atividades físicas', ['activities']]])} />
      <InfoSection title="Alimentação" icon={<Target />} items={items(detail, [['Quantidade de refeições', ['meals']], ['Rotina e alimentos informados', ['foodRoutine']], ['Restrições alimentares', ['restrictions']]])} />
      <InfoSection title="Rotina" icon={<Clock3 />} items={items(detail, [['Horário que acorda e dorme', ['wakeSleep']], ['Sono durante o dia', ['daySleep']], ['Nível de apetite', ['appetite']], ['Horário de maior apetite', ['appetiteTime']], ['Qualidade do sono', ['sleepQuality']]])} />
      <section className="commitment-card"><span>Determinação para seguir dieta e treino</span><strong>{determination || 'Não informado'}</strong>{numericScore(determination) !== null && <div><i style={{ width: `${numericScore(determination)! * 10}%` }} /></div>}</section>
      {warnings.length > 0 && <Attention answers={warnings} />}
    </section>}

    {tab === 'assessments' && <section className="history-panel student-history"><div className="section-title"><span>Evolução</span><h2>Histórico de avaliações</h2></div>{student.history.map(item => <article className={item.id === detail.id ? 'selected' : ''} key={item.id}><div><strong>{formatDateLong(item.completedAt || item.createdAt)}</strong><span className={`status ${item.status}`}>{statusLabel[item.status]}</span>{item.status === 'completed' && <small>Concluída em {formatDateTime(item.completedAt)}</small>}</div><div><span>Peso</span><strong>{unit(item.weight, 'kg')}</strong></div><div><span>% gordura</span><strong>{unit(item.bodyFat || '', '%', 'Não informado')}</strong></div><button onClick={() => selectAssessment(item.id)}>{item.id === detail.id ? 'Avaliação selecionada' : 'Ver avaliação'}</button></article>)}</section>}

    {tab === 'answers' && <Answers detail={detail} />}
    {tab === 'photos' && <PhotoGallery photos={detail.photos} loading={photosLoading} weight={detail.weight || valueFrom(detail, 'currentWeight')} date={selectedDate} onOpen={setActivePhoto} />}
    {activePhoto !== null && <Lightbox photos={detail.photos.filter(photo => photo.url)} index={activePhoto} onChange={setActivePhoto} onClose={() => setActivePhoto(null)} />}
  </>
}

function StudentHeading({ detail }: { detail: Detail }) { return <div><span className="admin-kicker">Ficha do aluno</span><h1>{detail.name}</h1>{detail.email && <a href={`mailto:${detail.email}`}>{detail.email}</a>}<div className={`student-status ${detail.status}`}><i />{statusLabel[detail.status]}</div></div> }
function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <article><div>{icon}</div><span>{label}</span><strong>{value}</strong></article> }
function InfoSection({ title, icon, items }: { title: string; icon: React.ReactNode; items: [string, string][] }) { if (!items.length) return null; return <section className="overview-section"><header>{icon}<h2>{title}</h2></header><div>{items.map(([label, value]) => <article key={label}><span>{label}</span><p>{value}</p></article>)}</div></section> }
function items(detail: Detail, definitions: [string, string[]][]) { return definitions.map(([label, keys]) => [label, valueFrom(detail, ...keys)] as [string, string]).filter(([, value]) => value) }

function Attention({ answers }: { answers: AnswerView[] }) { return <section className="attention-panel student-attention"><div className="attention-title"><AlertTriangle /><div><strong>ATENÇÃO</strong><span>Informações declaradas pelo próprio aluno.</span></div></div><div>{answers.map(item => <article key={item.key}><strong>{item.label}</strong><p>{item.value}</p></article>)}</div></section> }

function Answers({ detail }: { detail: Detail }) {
  const mapped = new Set<string>(responseSections.flatMap(([, keys]) => [...keys]))
  const sections: [string, AnswerView[]][] = responseSections.map(([title, keys]) => [title, keys.map(key => detail.answers.find(answer => answer.key === key)).filter((answer): answer is AnswerView => Boolean(answer))] as [string, AnswerView[]])
  const additional = detail.answers.filter(answer => !mapped.has(answer.key))
  if (additional.length) sections.push(['INFORMAÇÕES ADICIONAIS', additional])
  return <section className="answer-sheet"><div className="section-title"><span>Questionário completo</span><h2>Respostas da avaliação</h2></div>{sections.map(([title, answers]) => answers.length ? <div className="answer-category" key={title}><h3>{title}</h3>{answers.map(answer => <div className="answer-item" key={`${answer.key}-${answer.label}`}><strong>{answer.label}</strong><p>{answer.value}</p></div>)}</div> : null)}</section>
}

function PhotoGallery({ photos, loading, weight, date, onOpen }: { photos: PhotoView[]; loading: boolean; weight: string; date: string; onOpen: (index: number) => void }) {
  const available = photos.filter(photo => photo.url)
  return <section className="photos-panel"><div className="section-title"><span>Avaliação de {formatDate(date)}</span><h2>Registro fotográfico</h2></div>{loading && <div className="photo-loading"><div className="admin-loader" />Carregando fotos com acesso seguro...</div>}<div className="admin-photo-grid">{(['front', 'side', 'back'] as const).map(position => { const photo = available.find(item => item.position === position); const label = position === 'front' ? 'FRENTE' : position === 'side' ? 'LADO' : 'COSTAS'; return <article key={position}><span>{label}</span>{photo ? <button onClick={() => onOpen(available.indexOf(photo))}><img src={photo.url} alt={`Foto de ${label.toLowerCase()}`} loading="lazy" /><em>Ampliar foto</em></button> : <div className="photo-missing">Foto não disponível nesta avaliação.</div>}</article> })}</div><div className="photo-caption"><span><strong>Peso registrado:</strong> {unit(weight, 'kg')}</span><span><strong>Data:</strong> {formatDate(date)}</span></div></section>
}

function Lightbox({ photos, index, onChange, onClose }: { photos: PhotoView[]; index: number; onChange: (index: number) => void; onClose: () => void }) { const photo = photos[index]; if (!photo) return null; return <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visualização ampliada"><button className="lightbox-close" onClick={onClose}><X /> Fechar</button>{photos.length > 1 && <button className="lightbox-prev" onClick={() => onChange((index - 1 + photos.length) % photos.length)} aria-label="Foto anterior"><ChevronLeft /></button>}<figure><img src={photo.url} alt={photo.label} /><figcaption>{photo.label} · acesso temporário</figcaption></figure>{photos.length > 1 && <button className="lightbox-next" onClick={() => onChange((index + 1) % photos.length)} aria-label="Próxima foto"><ChevronRight /></button>}</div> }
function StudentSkeleton() { return <div className="student-skeleton" aria-label="Carregando ficha do aluno"><div /><section><i /><i /><i /><i /></section><article /><article /></div> }

function formatDate(value?: string) { return value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : 'Não informado' }
function formatDateLong(value: string) { return value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)).replace('.', '').toUpperCase() : 'DATA NÃO INFORMADA' }
function formatDateTime(value: string) { return value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : 'data não informada' }
function unit(value: string, suffix: string, fallback = 'Não informado') { return value ? `${value}${value.toLowerCase().includes(suffix.toLowerCase()) ? '' : ` ${suffix}`}` : fallback }
function height(value: string) { if (!value) return 'Não informado'; const number = Number(value.replace(',', '.')); return number > 3 ? `${(number / 100).toFixed(2).replace('.', ',')} m` : `${value.replace('.', ',')} m` }
function age(value: string) { if (!value) return 'Não informado'; if (/^\d{1,3}$/.test(value)) return `${value} anos`; const birth = new Date(`${value}T12:00:00`); if (Number.isNaN(birth.getTime())) return value; const today = new Date(); let years = today.getFullYear() - birth.getFullYear(); if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) years--; return `${years} anos` }
function isRelevant(value: string) { const normalized = value.trim().toLowerCase(); return Boolean(normalized) && !['não', 'nao', 'nunca', 'nenhuma', 'nenhum', 'não possuo', 'nao possuo'].includes(normalized) }
function numericScore(value: string) { const match = value.match(/(?:^|\s)(10|[0-9])(?:\s|\/|$)/); if (!match) return null; const score = Number(match[1]); return score >= 0 && score <= 10 ? score : null }
