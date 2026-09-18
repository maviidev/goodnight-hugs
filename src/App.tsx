import { useEffect, useState } from 'react'
import { Logo, Navigation, PhotoStep, Progress, StepForm, Success, Welcome } from './components'
import { steps } from './questions'
import { loadDraft, saveDraft, saveSubmission } from './storage'
import { submitAssessment } from './lib/assessment-submit'
import type { AnswerValue, PhotoKey, Photos } from './types'
import './evaluation.css'

const emptyPhotos: Photos = { front: null, side: null, back: null }

export default function App() {
  const [hasDraft, setHasDraft] = useState(false)
  const [screen, setScreen] = useState<'welcome' | 'form' | 'success'>('welcome')
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [photos, setPhotos] = useState<Photos>(emptyPhotos)
  const [invalidIds, setInvalidIds] = useState<string[]>([])
  const [photoInvalid, setPhotoInvalid] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const totalSteps = steps.length + 1
  const isPhotoStep = currentStep === steps.length

  useEffect(() => {
    const draft = loadDraft()
    setAnswers(draft)
    setHasDraft(Object.keys(draft).length > 0)
  }, [])
  useEffect(() => { if (Object.keys(answers).length) saveDraft(answers) }, [answers])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [currentStep, screen])

  function answer(id: string, value: AnswerValue) {
    setAnswers(previous => ({ ...previous, [id]: value }))
    setInvalidIds(previous => previous.filter(item => item !== id))
  }

  function setPhoto(key: PhotoKey, file: File | null) {
    setPhotos(previous => {
      if (previous[key]?.preview) URL.revokeObjectURL(previous[key]!.preview)
      return { ...previous, [key]: file ? { name: file.name, preview: URL.createObjectURL(file), file } : null }
    })
    setPhotoInvalid(false)
  }

  function validateStep() {
    if (isPhotoStep) {
      const valid = Object.values(photos).every(Boolean)
      setPhotoInvalid(!valid)
      return valid
    }
    const step = steps[currentStep]
    if (!step) return false
    const missing = step.questions.filter(question => {
      if (!question.required) return false
      const value = answers[question.id]
      return !value || (Array.isArray(value) ? value.length === 0 : !value.trim())
    }).map(question => question.id)
    setInvalidIds(missing)
    return missing.length === 0
  }

  async function next() {
    if (!validateStep()) return
    if (!isPhotoStep) { setCurrentStep(step => step + 1); setInvalidIds([]); return }
    setBusy(true); setSubmitError('')
    try {
      await submitAssessment(answers, photos)
      saveSubmission(answers, Object.fromEntries(Object.entries(photos).map(([key, photo]) => [key, photo?.name || ''])))
      setScreen('success')
    } catch (message) {
      setSubmitError(message instanceof Error ? message.message : 'Não foi possível enviar sua avaliação. Tente novamente.')
    } finally { setBusy(false) }
  }

  function back() {
    if (currentStep === 0) { setScreen('welcome'); return }
    setCurrentStep(step => step - 1); setInvalidIds([]); setPhotoInvalid(false)
  }

  function restart() {
    setAnswers({}); setPhotos(emptyPhotos); setCurrentStep(0); setScreen('welcome')
  }

  if (screen === 'welcome') return <Welcome hasDraft={hasDraft} onStart={() => setScreen('form')} />
  if (screen === 'success') return <Success name={String(answers.name || '')} onRestart={restart} />

  const activeStep = steps[currentStep]
  return <div className="xc-app"><div className="app-shell"><header className="topbar"><div className="brand"><Logo /><span>XC CONSULTORIA</span></div><span className="secure"><span /> Avaliação segura</span></header><Progress current={currentStep} total={totalSteps} /><main className="form-area">{isPhotoStep ? <PhotoStep photos={photos} onPhoto={setPhoto} invalid={photoInvalid} /> : activeStep ? <StepForm step={activeStep} answers={answers} invalidIds={invalidIds} onAnswer={answer} /> : null}{submitError && <div className="submission-error" role="alert">{submitError}</div>}<Navigation onBack={back} onNext={next} first={currentStep === 0} last={isPhotoStep} busy={busy} /></main><footer className="form-footer">Seus dados são confidenciais e protegidos · XC Consultoria</footer></div></div>
}
