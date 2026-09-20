export type Row = Record<string, unknown>
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed'

export type AssessmentSummary = {
  id: string
  clientId: string
  name: string
  email: string
  createdAt: string
  completedAt: string
  status: AssessmentStatus
  weight: string
  bodyFat?: string
  raw: Row
}

export type AnswerView = { key: string; label: string; value: string; category: string }
export type PhotoView = { id: string; label: string; position: 'front' | 'side' | 'back'; bucket: string; path: string; url?: string }

export type AssessmentDetail = AssessmentSummary & {
  profile: Row
  answers: AnswerView[]
  photos: PhotoView[]
  history: AssessmentSummary[]
}
