export type AnswerValue = string | string[]

export type Question = {
  id: string
  label: string
  helper?: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'single' | 'multiple' | 'date' | 'time'
  options?: string[]
  required?: boolean
  placeholder?: string
  suffix?: string
}

export type Step = {
  id: string
  title: string
  eyebrow: string
  description: string
  questions: Question[]
}

export type PhotoKey = 'front' | 'side' | 'back'
export type Photos = Record<PhotoKey, { name: string; preview: string } | null>
