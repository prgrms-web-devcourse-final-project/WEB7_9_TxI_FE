import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import PaymentSuccessPage from '@/pages/PaymentSuccessPage'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
})
