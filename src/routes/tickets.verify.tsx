import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import QrVerificationPage from '@/pages/QrVerificationPage'
import { z } from 'zod'

const searchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tickets/verify',
  validateSearch: searchSchema,
  component: QrVerificationPage,
})

