import { steps } from '../questions'

const categories: Record<string, string> = {
  name: 'DADOS PESSOAIS E CORPORAIS', email: 'DADOS PESSOAIS E CORPORAIS', phone: 'DADOS PESSOAIS E CORPORAIS', birthDate: 'DADOS PESSOAIS E CORPORAIS', height: 'DADOS PESSOAIS E CORPORAIS', currentWeight: 'DADOS PESSOAIS E CORPORAIS', bodyFat: 'DADOS PESSOAIS E CORPORAIS',
  shortGoal: 'OBJETIVOS E HISTÓRICO', longGoal: 'OBJETIVOS E HISTÓRICO', motivation: 'OBJETIVOS E HISTÓRICO', trainingTime: 'OBJETIVOS E HISTÓRICO', activities: 'OBJETIVOS E HISTÓRICO', trainingBreak: 'OBJETIVOS E HISTÓRICO',
  appetite: 'APETITE E METABOLISMO', appetiteTime: 'APETITE E METABOLISMO', weightDifficulty: 'APETITE E METABOLISMO',
  wakeSleep: 'SONO E INTESTINO', daySleep: 'SONO E INTESTINO', sleepQuality: 'SONO E INTESTINO',
  meals: 'ROTINA ALIMENTAR', foodRoutine: 'ROTINA ALIMENTAR', restrictions: 'ROTINA ALIMENTAR', water: 'ROTINA ALIMENTAR',
  alcohol: 'ESTIMULANTES E SUPLEMENTAÇÃO', smoking: 'ESTIMULANTES E SUPLEMENTAÇÃO',
  currentFrequency: 'TREINAMENTO', trainingAvailability: 'TREINAMENTO', preferredTraining: 'TREINAMENTO', dislikedExercises: 'TREINAMENTO', sessionDuration: 'TREINAMENTO',
  conditions: 'SAÚDE', medications: 'SAÚDE', injuries: 'SAÚDE', surgeries: 'SAÚDE',
  expectations: 'COMPROMETIMENTO E DIFICULDADES', occupation: 'INFORMAÇÕES ADICIONAIS',
}

export const categoryOrder = ['DADOS PESSOAIS E CORPORAIS', 'OBJETIVOS E HISTÓRICO', 'APETITE E METABOLISMO', 'SONO E INTESTINO', 'ROTINA ALIMENTAR', 'ESTIMULANTES E SUPLEMENTAÇÃO', 'TREINAMENTO', 'SAÚDE', 'COMPROMETIMENTO E DIFICULDADES', 'INFORMAÇÕES ADICIONAIS']
export const questionLabels = Object.fromEntries(steps.flatMap(step => step.questions.map(question => [question.id, question.label])))
export function questionCategory(key: string) { return categories[key] || 'INFORMAÇÕES ADICIONAIS' }
