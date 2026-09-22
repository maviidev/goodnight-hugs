import { Check, ChevronLeft, ChevronRight, Clock3, ShieldCheck, Sparkles, Upload, X } from 'lucide-react'
import type { AnswerValue, PhotoKey, Photos, Question, Step } from './types'

export function Logo() {
  return <div className="logo" aria-label="XC"><span>X</span><span>C</span></div>
}

export function Welcome({ onStart, hasDraft }: { onStart: () => void; hasDraft: boolean }) {
  return <main className="xc-app welcome page-enter">
    <header className="brand"><Logo /><span>XC CONSULTORIA</span></header>
    <section className="hero-card">
      <div className="hero-copy">
        <span className="kicker"><Sparkles size={15} /> Avaliação individual XC</span>
        <h1>Vamos começar<br />sua <em>avaliação.</em></h1>
        <p>Essa avaliação nos ajuda a conhecer melhor sua rotina, objetivos e condição atual para montarmos uma estratégia mais individualizada para você.</p>
        <div className="welcome-facts">
          <span><Clock3 size={18} /> Leva aproximadamente 5–10 minutos</span>
          <span><ShieldCheck size={18} /> Seus dados ficam salvos com segurança</span>
        </div>
        <button className="primary large" onClick={onStart}>{hasDraft ? 'Continuar avaliação' : 'Começar avaliação'} <ChevronRight size={20} /></button>
        {hasDraft && <small className="draft-note">Encontramos uma avaliação em andamento.</small>}
      </div>
      <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><Logo /><span>SEU PRÓXIMO NÍVEL<br />COMEÇA AQUI</span></div>
    </section>
    <footer>XC Consultoria · Avaliação Física e Nutricional</footer>
  </main>
}

export function Progress({ current, total }: { current: number; total: number }) {
  const percentage = Math.round(((current + 1) / total) * 100)
  return <div className="progress-wrap">
    <div className="progress-copy"><span>Etapa {current + 1} de {total}</span><strong>{percentage}% concluído</strong></div>
    <div className="progress-track"><div style={{ width: `${percentage}%` }} /></div>
  </div>
}

function OptionButton({ label, selected, multi, onClick }: { label: string; selected: boolean; multi?: boolean; onClick: () => void }) {
  return <button type="button" className={`option ${selected ? 'selected' : ''}`} onClick={onClick}>
    <span className={multi ? 'checkbox' : 'radio'}>{selected && <Check size={15} />}</span>{label}
  </button>
}

export function QuestionField({ question, value, onChange, invalid }: { question: Question; value: AnswerValue | undefined; onChange: (value: AnswerValue) => void; invalid?: boolean }) {
  const stringValue = typeof value === 'string' ? value : ''
  const multipleValue = Array.isArray(value) ? value : []
  const input = question.type === 'single' ? (
    <div className="options">{question.options?.map(option => <OptionButton key={option} label={option} selected={stringValue === option} onClick={() => onChange(option)} />)}</div>
  ) : question.type === 'multiple' ? (
    <div className="options">{question.options?.map(option => <OptionButton key={option} label={option} multi selected={multipleValue.includes(option)} onClick={() => onChange(multipleValue.includes(option) ? multipleValue.filter(item => item !== option) : [...multipleValue, option])} />)}</div>
  ) : question.type === 'textarea' ? (
    <textarea value={stringValue} placeholder={question.placeholder} rows={4} onChange={event => onChange(event.target.value)} />
  ) : (
    <div className="input-wrap"><input value={stringValue} type={question.type} inputMode={question.type === 'number' ? 'decimal' : undefined} placeholder={question.placeholder} onChange={event => onChange(event.target.value)} />{question.suffix && <span>{question.suffix}</span>}</div>
  )
  return <div className={`question ${invalid ? 'invalid' : ''}`}>
    <label>{question.label}{question.required && <b>*</b>}</label>
    {question.helper && <p>{question.helper}</p>}{input}
    {invalid && <small>Preencha este campo para continuar.</small>}
  </div>
}

export function StepForm({ step, answers, invalidIds, onAnswer }: { step: Step; answers: Record<string, AnswerValue>; invalidIds: string[]; onAnswer: (id: string, value: AnswerValue) => void }) {
  return <section className="form-card page-enter">
    <div className="step-heading"><span>{step.eyebrow}</span><h2>{step.title}</h2><p>{step.description}</p></div>
    <div className="question-list">{step.questions.map(question => <QuestionField key={question.id} question={question} value={answers[question.id]} invalid={invalidIds.includes(question.id)} onChange={value => onAnswer(question.id, value)} />)}</div>
  </section>
}

const photoInfo: { key: PhotoKey; title: string; guide: string }[] = [
  { key: 'front', title: 'Foto de frente', guide: 'Corpo inteiro, braços relaxados' },
  { key: 'side', title: 'Foto de lado', guide: 'Perfil completo e postura natural' },
  { key: 'back', title: 'Foto de costas', guide: 'Corpo inteiro, braços relaxados' },
]

export function PhotoStep({ photos, onPhoto, invalid }: { photos: Photos; onPhoto: (key: PhotoKey, file: File | null) => void; invalid: boolean }) {
  return <section className="form-card page-enter"><div className="step-heading"><span>Registro visual</span><h2>Fotos de avaliação</h2><p>Use roupas de treino ajustadas, boa iluminação e mantenha a câmera na altura da cintura.</p></div>
    <div className="photo-grid">{photoInfo.map(item => <div className={`photo-card ${photos[item.key] ? 'filled' : ''}`} key={item.key}>
      {photos[item.key] ? <><img src={photos[item.key]!.preview} alt={item.title} /><button type="button" className="remove-photo" onClick={() => onPhoto(item.key, null)} aria-label={`Remover ${item.title}`}><X size={17} /></button><span className="photo-ok"><Check size={14} /> Adicionada</span></> : <label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => onPhoto(item.key, event.target.files?.[0] || null)} /><Upload size={25} /><strong>{item.title}</strong><span>{item.guide}</span><em>Adicionar foto</em></label>}
    </div>)}</div>{invalid && <p className="photo-error">Adicione as três fotos para concluir sua avaliação.</p>}<div className="privacy"><ShieldCheck size={20} /><span><strong>Privacidade em primeiro lugar.</strong> Suas fotos serão usadas exclusivamente para acompanhar sua evolução.</span></div>
  </section>
}

export function Navigation({ onBack, onNext, first, last, busy }: { onBack: () => void; onNext: () => void; first: boolean; last: boolean; busy: boolean }) {
  return <div className="navigation"><button className="secondary" onClick={onBack}>{first ? 'Sair' : <><ChevronLeft size={19} /> Voltar</>}</button><button className="primary" onClick={onNext} disabled={busy}>{last ? (busy ? 'Enviando...' : 'Enviar avaliação') : <>Continuar <ChevronRight size={19} /></>}</button></div>
}

export function Success({ name, onRestart }: { name: string; onRestart: () => void }) {
  return <main className="xc-app success page-enter"><div className="success-card"><div className="success-icon"><Check /></div><Logo /><span className="kicker">Avaliação concluída</span><h1>Tudo certo{name ? `, ${name.split(' ')[0]}` : ''}!</h1><p>Recebemos suas informações. A equipe XC vai analisar cada detalhe para preparar uma estratégia feita para você.</p><div className="next-box"><strong>O que acontece agora?</strong><span>Seu treinador entrará em contato após revisar a avaliação.</span></div><button className="secondary" onClick={onRestart}>Voltar ao início</button></div></main>
}
