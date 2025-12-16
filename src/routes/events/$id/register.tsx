import { createRoute } from "@tanstack/react-router";
import { Route as eventsIdRoute } from "../$id";
import PreRegistrationPage from "@/pages/PreRegistrationPage";
import { requireAuth } from "@/utils/auth";

export const Route = createRoute({
  getParentRoute: () => eventsIdRoute,
  path: "register",
  beforeLoad: ({ location }) => requireAuth(location),
  component: PreRegistrationPage,
});
