import { createFileRoute } from '@tanstack/react-router'
import { AssessmentDetailPage } from '../admin/AssessmentDetail'

export const Route = createFileRoute('/admin/avaliacoes/$assessmentId')({
  head: () => ({ meta: [{ title: 'Ficha de Avaliação — XConsultoria' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AssessmentRoute,
})

function AssessmentRoute() { const { assessmentId } = Route.useParams(); return <AssessmentDetailPage assessmentId={assessmentId} /> }
