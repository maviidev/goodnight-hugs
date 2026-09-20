import { createFileRoute } from '@tanstack/react-router'
import { ChangePassword } from '../admin/ChangePassword'

export const Route = createFileRoute('/admin/alterar-senha')({
  head: () => ({ meta: [{ title: 'Alterar senha — XConsultoria' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: ChangePassword,
})
