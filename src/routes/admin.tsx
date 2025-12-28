import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import { requireAdmin } from '@/utils/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: ({ location }) => requireAdmin(location),
  component: AdminDashboardPage,
})