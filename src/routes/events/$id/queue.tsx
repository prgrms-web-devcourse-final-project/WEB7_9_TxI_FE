import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from '../../__root'
import QueuePage from '@/pages/QueuePage'
import { requireAuth } from '@/utils/auth'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$id/queue',
  beforeLoad: ({ location }) => requireAuth(location),
  component: QueuePage,
})
