import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "../../__root";
import PreRegistrationPage from "@/pages/PreRegistrationPage";
import { requireAuth } from "@/utils/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events/$id/register",
  beforeLoad: ({ location }) => requireAuth(location),
  component: PreRegistrationPage,
});
