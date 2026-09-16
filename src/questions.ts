import type { Step } from './types'

export const steps: Step[] = [
  {
    id: 'personal', title: 'Dados pessoais', eyebrow: 'Primeiro, vamos nos conhecer',
    description: 'Informações básicas para identificar sua avaliação.',
    questions: [
      { id: 'name', label: 'Qual é o seu nome completo?', type: 'text', required: true, placeholder: 'Digite seu nome completo' },
      { id: 'email', label: 'Qual é o seu e-mail para contato?', type: 'email', required: true, placeholder: 'voce@email.com' },
      { id: 'phone', label: 'Qual é o seu WhatsApp?', type: 'text', required: true, placeholder: '(00) 00000-0000' },
      { id: 'birthDate', label: 'Qual é a sua data de nascimento?', type: 'date', required: true },
      { id: 'height', label: 'Qual é a sua altura?', type: 'number', required: true, placeholder: 'Ex.: 170', suffix: 'cm' },
    ],
  },
  {
    id: 'goals', title: 'Seus objetivos', eyebrow: 'Onde você quer chegar?',
    description: 'Conte com clareza o resultado que você está buscando.',
    questions: [
      { id: 'shortGoal', label: 'Qual é o seu objetivo em curto prazo?', type: 'textarea', required: true, placeholder: 'Ex.: perder gordura, ganhar massa muscular...' },
      { id: 'longGoal', label: 'Qual é o seu objetivo em longo prazo?', helper: 'Se necessário, você aceita um objetivo intermediário para chegar lá mais rápido?', type: 'textarea', required: true, placeholder: 'Descreva o resultado que deseja alcançar' },
      { id: 'weightDifficulty', label: 'Você geralmente tem mais dificuldade para...', type: 'single', required: true, options: ['Perder peso', 'Ganhar peso', 'Manter o peso', 'Não sei informar'] },
      { id: 'motivation', label: 'O que mais motiva você a buscar esse resultado?', type: 'textarea', required: true, placeholder: 'Conte o principal motivo da sua decisão' },
    ],
  },
  {
    id: 'history', title: 'Histórico de treinamento', eyebrow: 'Sua experiência importa',
    description: 'Isso nos ajuda a definir um ponto de partida seguro.',
    questions: [
      { id: 'trainingTime', label: 'Há quanto tempo pratica musculação sem intervalos?', helper: 'Conte também se já praticou em outros períodos.', type: 'textarea', required: true, placeholder: 'Ex.: treino há 1 ano; já treinei antes por 2 anos...' },
      { id: 'activities', label: 'Quais atividades físicas você já praticou?', type: 'multiple', options: ['Musculação', 'Corrida', 'Ciclismo', 'Natação', 'Lutas', 'Futebol', 'Funcional', 'Outra', 'Nenhuma'] },
      { id: 'currentFrequency', label: 'Quantas vezes por semana você treina atualmente?', type: 'single', required: true, options: ['Não treino atualmente', '1–2 vezes', '3–4 vezes', '5–6 vezes', 'Todos os dias'] },
      { id: 'trainingBreak', label: 'Teve alguma pausa longa nos últimos 12 meses?', type: 'single', required: true, options: ['Não', 'Sim, menos de 1 mês', 'Sim, de 1 a 3 meses', 'Sim, mais de 3 meses'] },
    ],
  },
  {
    id: 'routine', title: 'Sua rotina', eyebrow: 'Como é o seu dia?',
    description: 'Vamos adaptar a estratégia à sua vida real.',
    questions: [
      { id: 'occupation', label: 'Qual é sua profissão e como é sua rotina de trabalho?', type: 'textarea', required: true, placeholder: 'Ex.: trabalho sentado de segunda a sábado...' },
      { id: 'wakeSleep', label: 'Que horas geralmente acorda e dorme?', type: 'text', required: true, placeholder: 'Ex.: acordo às 6h e durmo às 23h' },
      { id: 'daySleep', label: 'Sente sono durante o dia com frequência?', type: 'single', required: true, options: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Todos os dias'] },
      { id: 'trainingAvailability', label: 'Quais dias e horários você tem disponíveis para treinar?', type: 'textarea', required: true, placeholder: 'Ex.: segunda a sexta, depois das 18h' },
    ],
  },
  {
    id: 'food', title: 'Alimentação', eyebrow: 'Vamos falar sobre sua alimentação',
    description: 'Não existem respostas certas ou erradas. Seja sincero.',
    questions: [
      { id: 'appetite', label: 'Como você considera seu apetite?', type: 'single', required: true, options: ['Pouco apetite', 'Apetite moderado', 'Muito apetite', 'Varia bastante'] },
      { id: 'appetiteTime', label: 'Em qual horário do dia sente mais apetite?', type: 'single', required: true, options: ['Manhã', 'Tarde', 'Noite', 'Madrugada', 'Não percebo diferença'] },
      { id: 'meals', label: 'Quantas refeições costuma fazer por dia?', type: 'single', required: true, options: ['1–2', '3', '4', '5', '6 ou mais'] },
      { id: 'foodRoutine', label: 'Descreva como é sua alimentação em um dia comum', type: 'textarea', required: true, placeholder: 'Inclua horários, alimentos e quantidades aproximadas' },
      { id: 'restrictions', label: 'Possui alergia, intolerância ou restrição alimentar?', type: 'textarea', placeholder: 'Se não possuir, escreva “Não”' },
    ],
  },
  {
    id: 'health', title: 'Saúde e histórico', eyebrow: 'Sua segurança vem primeiro',
    description: 'Essas informações são essenciais para individualizar o acompanhamento.',
    questions: [
      { id: 'conditions', label: 'Possui alguma doença ou condição diagnosticada?', type: 'textarea', required: true, placeholder: 'Ex.: hipertensão, diabetes, gastrite. Se não, escreva “Não”' },
      { id: 'medications', label: 'Usa algum medicamento continuamente?', type: 'textarea', required: true, placeholder: 'Informe nome e dose. Se não, escreva “Não”' },
      { id: 'injuries', label: 'Possui dor, lesão ou limitação de movimento?', type: 'textarea', required: true, placeholder: 'Informe local, diagnóstico e quando sente. Se não, escreva “Não”' },
      { id: 'surgeries', label: 'Já realizou alguma cirurgia?', type: 'textarea', placeholder: 'Informe qual e quando. Se não, escreva “Não”' },
    ],
  },
  {
    id: 'habits', title: 'Hábitos', eyebrow: 'Pequenos hábitos, grandes resultados',
    description: 'Agora precisamos entender seu descanso e estilo de vida.',
    questions: [
      { id: 'sleepQuality', label: 'Como avalia a qualidade do seu sono?', type: 'single', required: true, options: ['Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente'] },
      { id: 'water', label: 'Quanta água costuma beber por dia?', type: 'single', required: true, options: ['Menos de 1 litro', '1–2 litros', '2–3 litros', 'Mais de 3 litros', 'Não sei'] },
      { id: 'alcohol', label: 'Com que frequência consome bebida alcoólica?', type: 'single', required: true, options: ['Nunca', 'Raramente', '1 vez por semana', '2–3 vezes por semana', 'Quase todos os dias'] },
      { id: 'smoking', label: 'Fuma ou utiliza alguma outra substância?', type: 'single', required: true, options: ['Não', 'Já usei, mas parei', 'Sim, ocasionalmente', 'Sim, frequentemente'] },
    ],
  },
  {
    id: 'training', title: 'Treinamento', eyebrow: 'Hora de montar a estratégia',
    description: 'Preferências ajudam a criar um plano que você consiga manter.',
    questions: [
      { id: 'preferredTraining', label: 'Quais modalidades você mais gosta?', type: 'multiple', required: true, options: ['Musculação', 'Cardio', 'Funcional', 'Corrida', 'Lutas', 'Esportes coletivos', 'Treino ao ar livre'] },
      { id: 'dislikedExercises', label: 'Existe algum exercício que não gosta ou evita?', type: 'textarea', placeholder: 'Conte o motivo, se houver' },
      { id: 'sessionDuration', label: 'Quanto tempo pode dedicar a cada treino?', type: 'single', required: true, options: ['Até 30 minutos', '30–45 minutos', '45–60 minutos', '60–90 minutos', 'Mais de 90 minutos'] },
    ],
  },
  {
    id: 'current', title: 'Avaliação atual', eyebrow: 'Estamos quase lá',
    description: 'Registre sua condição atual para acompanharmos sua evolução.',
    questions: [
      { id: 'currentWeight', label: 'Qual é o seu peso atual?', type: 'number', required: true, placeholder: 'Ex.: 78,5', suffix: 'kg' },
      { id: 'bodyFat', label: 'Sabe seu percentual de gordura atual?', type: 'number', placeholder: 'Opcional', suffix: '%' },
      { id: 'expectations', label: 'O que espera do acompanhamento da XC?', type: 'textarea', required: true, placeholder: 'Conte como podemos ajudar você' },
    ],
  },
]

export const totalQuestions = steps.reduce((sum, step) => sum + step.questions.length, 0)
