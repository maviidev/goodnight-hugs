import { createFileRoute } from '@tanstack/react-router'
import { AdminAuth } from '../admin/AdminAuth'
import { AssessmentDetailPage } from '../admin/AssessmentDetail'
import { AdminLayout } from '../admin/AdminLayout'

export const Route = createFileRoute('/admin/avaliacoes/$assessmentId')({
  head: () => ({ meta: [{ title: 'Ficha de Avaliação — XConsultoria' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AssessmentRoute,
})

function AssessmentRoute() { const { assessmentId } = Route.useParams(); return <AdminAuth><AdminLayout><AssessmentDetailPage assessmentId={assessmentId} /></AdminLayout></AdminAuth> }
