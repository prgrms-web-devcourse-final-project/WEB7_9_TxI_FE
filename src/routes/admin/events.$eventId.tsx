import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from '../__root'
import AdminEventManagementPage from '@/pages/AdminEventManagementPage'
import { requireAdmin } from '@/utils/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/events/$eventId',
  beforeLoad: ({ location }) => requireAdmin(location),
  component: AdminEventManagementPage,
})

