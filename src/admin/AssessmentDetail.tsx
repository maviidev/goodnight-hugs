import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, Dumbbell, Flag, Ruler, Scale, Target, X } from 'lucide-react'
import { loadAssessmentDetail, valueFrom } from './data'
import { categoryOrder } from './question-map'
import type { AssessmentDetail as Detail, PhotoView } from './types'

const formatDate = (value: string) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value)) : '—'
const warningKeys = ['restrictions', 'conditions', 'medications', 'smoking', 'injuries', 'surgeries']

export function AssessmentDetailPage({ assessmentId }: { assessmentId: string }) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [activePhoto, setActivePhoto] = useState<number | null>(null)
  useEffect(() => { loadAssessmentDetail(assessmentId).then(setDetail).catch(message => setError(message instanceof Error ? message.message : 'Não foi possível abrir a avaliação.')) }, [assessmentId])
  const warnings = useMemo(() => detail?.answers.filter(answer => warningKeys.includes(answer.key) && !['não','nao','nunca','nenhuma','nenhum'].includes(answer.value.trim().toLowerCase())) || [], [detail])
  if (error) return <><a href="/admin" className="back-link"><ArrowLeft size={17} /> Voltar</a><div className="admin-alert danger">{error}</div></>
  if (!detail) return <div className="admin-empty"><div className="admin-loader" />Carregando ficha...</div>
  const cards = [
    ['Peso', detail.weight ? `${detail.weight} kg` : '—', <Scale />], ['Altura', suffix(valueFrom(detail, 'height'), 'cm'), <Ruler />], ['Idade', age(valueFrom(detail, 'birthDate', 'birth_date', 'age')), <CalendarDays />], ['% gordura', suffix(valueFrom(detail, 'bodyFat', 'body_fat', 'body_fat_percentage'), '%'), <Target />],
    ['Objetivo principal', valueFrom(detail, 'shortGoal'), <Flag />], ['Dias de treino', valueFrom(detail, 'currentFrequency', 'training_days'), <Dumbbell />], ['Tempo disponível', valueFrom(detail, 'sessionDuration'), <Clock3 />], ['Determinação', valueFrom(detail, 'determination', 'commitment', 'motivation'), <Target />],
  ] as const
  return <><a href="/admin" className="back-link"><ArrowLeft size={17} /> Voltar para avaliações</a><section className="detail-hero"><div><span className="admin-kicker">Ficha de avaliação</span><h1>{detail.name}</h1><a href={`mailto:${detail.email}`}>{detail.email}</a></div><div className="detail-meta"><span className="status completed">{detail.status === 'completed' ? 'Concluída' : detail.status === 'in_progress' ? 'Em andamento' : 'Não iniciada'}</span><small>Avaliação de {formatDate(detail.completedAt || detail.createdAt)}</small></div></section>
    <section className="highlight-grid">{cards.map(([label,value,icon]) => <article key={label}><div>{icon}</div><span>{label}</span><strong>{value || '—'}</strong></article>)}</section>
    {warnings.length > 0 && <section className="attention-panel"><div className="attention-title"><AlertTriangle /><div><strong>Pontos de atenção informados</strong><span>Confira estas respostas antes de orientar o aluno.</span></div></div><div>{warnings.map(item => <article key={item.key}><strong>{item.label}</strong><p>{item.value}</p></article>)}</div></section>}
    <section className="answer-sheet"><div className="section-title"><span>Ficha profissional</span><h2>Respostas da avaliação</h2></div>{categoryOrder.map(category => { const answers = detail.answers.filter(answer => answer.category === category); if (!answers.length) return null; return <div className="answer-category" key={category}><h3>{category}</h3>{answers.map(answer => <div className="answer-item" key={`${answer.key}-${answer.label}`}><strong>{answer.label}</strong><p>{answer.value}</p></div>)}</div> })}</section>
    <PhotoGallery photos={detail.photos} weight={detail.weight} date={detail.completedAt || detail.createdAt} onOpen={setActivePhoto} />
    <section className="history-panel"><div className="section-title"><span>Evolução</span><h2>Histórico de avaliações</h2></div>{detail.history.map(item => <article key={item.id}><span>{formatDate(item.completedAt || item.createdAt)}</span><strong>{item.weight ? `${item.weight} kg` : 'Peso não informado'}</strong><a href={`/admin/avaliacoes/${item.id}`}>{item.id === detail.id ? 'Avaliação atual' : 'Abrir'}</a></article>)}</section>
    {activePhoto !== null && <Lightbox photos={detail.photos.filter(photo => photo.url)} index={activePhoto} onChange={setActivePhoto} onClose={() => setActivePhoto(null)} />}
  </>
}

function suffix(value: string, unit: string) { return value ? `${value}${value.includes(unit) ? '' : ` ${unit}`}` : '—' }
function age(value: string) { if (!value) return '—'; if (/^\d{1,3}$/.test(value)) return `${value} anos`; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; let years = new Date().getFullYear() - date.getFullYear(); if (new Date().getTime() < new Date(new Date().getFullYear(), date.getMonth(), date.getDate()).getTime()) years--; return `${years} anos` }

function PhotoGallery({ photos, weight, date, onOpen }: { photos: PhotoView[]; weight: string; date: string; onOpen: (index: number) => void }) {
  const available = photos.filter(photo => photo.url)
  return <section className="photos-panel"><div className="section-title"><span>Acompanhamento corporal</span><h2>Registro fotográfico</h2></div><div className="admin-photo-grid">{(['front','side','back'] as const).map(position => { const photo = available.find(item => item.position === position); const label = position === 'front' ? 'FRENTE' : position === 'side' ? 'LADO' : 'COSTAS'; return <article key={position}><span>{label}</span>{photo ? <button onClick={() => onOpen(available.indexOf(photo))}><img src={photo.url} alt={`Foto de ${label.toLowerCase()}`} /><em>Ampliar foto</em></button> : <div className="photo-missing">Foto não disponível</div>}</article> })}</div><div className="photo-caption"><span><strong>Peso no momento das fotos:</strong> {weight ? `${weight} kg` : '—'}</span><span><strong>Data:</strong> {formatDate(date)}</span></div></section>
}

function Lightbox({ photos, index, onChange, onClose }: { photos: PhotoView[]; index: number; onChange: (index: number) => void; onClose: () => void }) {
  const photo = photos[index]
  if (!photo) return null
  const previous = () => onChange((index - 1 + photos.length) % photos.length)
  const next = () => onChange((index + 1) % photos.length)
  return <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visualização ampliada"><button className="lightbox-close" onClick={onClose}><X /> Fechar</button>{photos.length > 1 && <button className="lightbox-prev" onClick={previous} aria-label="Foto anterior"><ChevronLeft /></button>}<figure><img src={photo.url} alt={photo.label} /><figcaption>{photo.label} · acesso temporário</figcaption></figure>{photos.length > 1 && <button className="lightbox-next" onClick={next} aria-label="Próxima foto"><ChevronRight /></button>}</div>
}
