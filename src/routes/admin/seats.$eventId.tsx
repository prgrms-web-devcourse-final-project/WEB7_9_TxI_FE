import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from '../__root'
import AdminSeatManagementPage from '@/pages/AdminSeatManagementPage'
import { requireAdmin } from '@/utils/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/seats/$eventId',
  beforeLoad: ({ location }) => requireAdmin(location),
  component: AdminSeatManagementPage,
})

