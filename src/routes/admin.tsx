import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AdminAuth } from '../admin/AdminAuth'
import { AdminLayout } from '../admin/AdminLayout'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Painel de Avaliações — XConsultoria' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AdminRoute,
})

function AdminRoute() { return <AdminAuth><AdminLayout><Outlet /></AdminLayout></AdminAuth> }
