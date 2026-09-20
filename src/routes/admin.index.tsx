import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '../admin/Dashboard'

export const Route = createFileRoute('/admin/')({
  component: Dashboard,
})
