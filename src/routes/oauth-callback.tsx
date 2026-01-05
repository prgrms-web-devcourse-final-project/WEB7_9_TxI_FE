import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import OAuthCallbackPage from '@/pages/OAuthCallbackPage'

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: '/oauth/callback',
    component: OAuthCallbackPage,
})
