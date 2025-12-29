import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from '../__root'
import AdminQueueManagementPage from '@/pages/AdminQueueManagementPage'
import { requireAdmin } from '@/utils/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/queue/$eventId',
  beforeLoad: ({ location }) => requireAdmin(location),
  component: AdminQueueManagementPage,
})

