import type { AnswerValue } from './types'

export const DRAFT_KEY = 'xc-evaluation-draft-v1'
export const SUBMISSIONS_KEY = 'xc-evaluation-submissions-v1'

export function loadDraft(): Record<string, AnswerValue> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') } catch { return {} }
}

export function saveDraft(answers: Record<string, AnswerValue>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DRAFT_KEY, JSON.stringify(answers))
}

export function saveSubmission(answers: Record<string, AnswerValue>, photoNames: Record<string, string>) {
  if (typeof window === 'undefined') throw new Error('Envio disponível apenas no navegador')
  const previous = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]')
  const submission = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), answers, photoNames }
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([submission, ...previous]))
  localStorage.removeItem(DRAFT_KEY)
  return submission
}
