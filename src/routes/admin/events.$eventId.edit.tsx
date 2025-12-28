import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from '../__root'
import AdminEventEditPage from '@/pages/AdminEventEditPage'
import { requireAdmin } from '@/utils/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/events/$eventId/edit',
  beforeLoad: ({ location }) => requireAdmin(location),
  component: AdminEventEditPage,
})

