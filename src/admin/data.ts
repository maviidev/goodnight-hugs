import { createSignedPhotoUrl, selectRows } from '../lib/supabase-rest'
import { questionCategory, questionLabels } from './question-map'
import type { AnswerView, AssessmentDetail, AssessmentStatus, AssessmentSummary, PhotoView, Row } from './types'

const text = (value: unknown) => value == null ? '' : Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? Object.values(value as Row).join(', ') : String(value)
const pick = (row: Row | undefined, ...keys: string[]) => keys.map(key => row?.[key]).find(value => value !== undefined && value !== null && value !== '')

function statusOf(row: Row): AssessmentStatus {
  const value = text(pick(row, 'status', 'state')).toLowerCase()
  if (['completed', 'complete', 'concluida', 'concluída', 'finished'].includes(value) || pick(row, 'completed_at', 'submitted_at')) return 'completed'
  if (['not_started', 'pending', 'nao_iniciada', 'não iniciada'].includes(value)) return 'not_started'
  return 'in_progress'
}

function profileId(row: Row) { return text(pick(row, 'client_id', 'profile_id', 'student_id', 'user_id')) }

function summary(row: Row, profiles: Row[]): AssessmentSummary {
  const clientId = profileId(row)
  const profile = profiles.find(item => text(pick(item, 'id', 'user_id')) === clientId) || {}
  return {
    id: text(row.id), clientId,
    name: text(pick(profile, 'full_name', 'name', 'display_name') || pick(row, 'student_name', 'client_name', 'name') || 'Aluno'),
    email: text(pick(profile, 'email') || pick(row, 'email')),
    createdAt: text(pick(row, 'created_at', 'started_at')),
    completedAt: text(pick(row, 'completed_at', 'submitted_at', 'updated_at')),
    status: statusOf(row), weight: text(pick(row, 'current_weight', 'weight')), raw: row,
  }
}

async function safeSelect(table: string) {
  try { return await selectRows(table, 'select=*') } catch (error) {
    if (table === 'profiles') return selectRows('clients', 'select=*').catch(() => [])
    throw error
  }
}

export async function loadAssessments() {
  const [assessments, profiles] = await Promise.all([safeSelect('assessments'), safeSelect('profiles')])
  return assessments.map(row => summary(row, profiles))
}

export async function loadAssessmentDetail(id: string): Promise<AssessmentDetail> {
  const [assessmentRows, profiles, answerRows, photoRows, allAssessments] = await Promise.all([
    selectRows('assessments', `select=*&id=eq.${encodeURIComponent(id)}&limit=1`), safeSelect('profiles'),
    selectRows('assessment_answers', `select=*&assessment_id=eq.${encodeURIComponent(id)}`),
    selectRows('assessment_photos', `select=*&assessment_id=eq.${encodeURIComponent(id)}`).catch(() => []),
    loadAssessments().catch(() => []),
  ])
  const row = assessmentRows[0]
  if (!row) throw new Error('Avaliação não encontrada ou sem permissão de acesso.')
  const base = summary(row, profiles)
  const profile = profiles.find(item => text(pick(item, 'id', 'user_id')) === base.clientId) || {}
  const answers: AnswerView[] = answerRows.map(item => {
    const key = text(pick(item, 'question_id', 'question_key', 'key', 'field'))
    return { key, label: questionLabels[key] || text(pick(item, 'question', 'label')) || 'Informação adicional', value: text(pick(item, 'answer', 'value', 'response')), category: questionCategory(key) }
  }).filter(item => item.value)
  if (!base.weight) base.weight = answers.find(item => item.key === 'currentWeight')?.value || ''
  base.bodyFat = answers.find(item => item.key === 'bodyFat')?.value || ''
  const photos: PhotoView[] = photoRows.map((item, index) => {
    const rawPosition = text(pick(item, 'position', 'photo_type', 'type', 'view')).toLowerCase()
    const position = rawPosition.includes('side') || rawPosition.includes('lado') ? 'side' : rawPosition.includes('back') || rawPosition.includes('cost') ? 'back' : index === 1 ? 'side' : index === 2 ? 'back' : 'front'
    return { id: text(item.id || index), position, label: position === 'front' ? 'FRENTE' : position === 'side' ? 'LADO' : 'COSTAS', bucket: text(pick(item, 'bucket', 'bucket_id')) || 'assessment-photos', path: text(pick(item, 'storage_path', 'path', 'file_path', 'object_path')) }
  })
  const email = base.email.trim().toLowerCase()
  const assessmentPool = allAssessments.some(item => item.id === base.id) ? allAssessments : [base, ...allAssessments]
  const history = assessmentPool.filter(item => item.id === base.id || (base.clientId ? item.clientId === base.clientId : Boolean(email) && item.email.trim().toLowerCase() === email)).sort((a, b) => Date.parse(b.completedAt || b.createdAt) - Date.parse(a.completedAt || a.createdAt))
  const historyIds = history.map(item => item.id).filter(Boolean)
  if (historyIds.length) {
    const rows = await selectRows('assessment_answers', `select=assessment_id,question_key,answer&assessment_id=in.(${historyIds.join(',')})`).catch(() => [])
    history.forEach(item => {
      const related = rows.filter(answer => text(answer.assessment_id) === item.id)
      if (!item.weight) item.weight = text(related.find(answer => text(answer.question_key) === 'currentWeight')?.answer)
      item.bodyFat = text(related.find(answer => text(answer.question_key) === 'bodyFat')?.answer)
    })
  }
  return { ...base, profile, answers, photos, history }
}

export async function loadPhotoUrls(photos: PhotoView[]) {
  return Promise.all(photos.map(async photo => {
    if (!photo.path || photo.url) return photo
    const signedUrl = await createSignedPhotoUrl(photo.bucket, photo.path).catch(() => undefined)
    return signedUrl ? { ...photo, url: signedUrl } : photo
  }))
}

export const valueFrom = (detail: AssessmentDetail, ...keys: string[]) => detail.answers.find(answer => keys.includes(answer.key))?.value || text(pick(detail.profile, ...keys) || pick(detail.raw, ...keys))
