import { createFileRoute } from '@tanstack/react-router'
import { AdminAuth } from '../admin/AdminAuth'
import { ChangePassword } from '../admin/ChangePassword'
import { AdminLayout } from '../admin/AdminLayout'

export const Route = createFileRoute('/admin/alterar-senha')({
  head: () => ({ meta: [{ title: 'Alterar senha — XConsultoria' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: ChangePasswordRoute,
})

function ChangePasswordRoute() { return <AdminAuth><AdminLayout><ChangePassword /></AdminLayout></AdminAuth> }
