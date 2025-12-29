import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from '../__root'
import AdminEventCreatePage from '@/pages/AdminEventCreatePage'
import { requireAdmin } from '@/utils/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/events/new',
  beforeLoad: ({ location }) => requireAdmin(location),
  component: AdminEventCreatePage,
})

