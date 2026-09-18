import { steps } from '../questions'
import type { AnswerValue, Photos } from '../types'
import { SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config'

const api = SUPABASE_PROJECT_URL.replace(/\/$/, '')
const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` }

async function rpc(name: string, body: unknown) {
  const response = await fetch(`${api}/rest/v1/rpc/${name}`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.message || 'Não foi possível salvar os dados da avaliação.') }
}

async function upload(bucket: string, path: string, file: File) {
  const response = await fetch(`${api}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'POST', headers: { ...headers, 'Content-Type': file.type, 'x-upsert': 'false' }, body: file })
  if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.message || 'Não foi possível enviar uma das fotos.') }
}

export async function submitAssessment(answers: Record<string, AnswerValue>, photos: Photos) {
  const assessmentId = crypto.randomUUID()
  const allowedKeys = new Set(steps.flatMap(step => step.questions.map(question => question.id)))
  const safeAnswers = Object.fromEntries(Object.entries(answers).filter(([key]) => allowedKeys.has(key)))
  await rpc('submit_assessment', {
    p_id: assessmentId, p_name: String(answers.name || ''), p_email: String(answers.email || ''),
    p_weight: Number(String(answers.currentWeight || '').replace(',', '.')) || null, p_answers: safeAnswers,
  })
  for (const [position, photo] of Object.entries(photos)) {
    if (!photo) continue
    const extension = photo.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${assessmentId}/${position}-${crypto.randomUUID()}.${extension}`
    await upload('assessment-photos', path, photo.file)
    await rpc('register_assessment_photo', { p_assessment_id: assessmentId, p_position: position, p_path: path })
  }
  return assessmentId
}
