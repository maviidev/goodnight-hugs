import { createFileRoute } from '@tanstack/react-router'
import { AdminAuth } from '../admin/AdminAuth'
import { AdminLayout } from '../admin/AdminLayout'
import { Dashboard } from '../admin/Dashboard'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Painel de Avaliações — XConsultoria' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AdminRoute,
})

function AdminRoute() { return <AdminAuth><AdminLayout><Dashboard /></AdminLayout></AdminAuth> }
