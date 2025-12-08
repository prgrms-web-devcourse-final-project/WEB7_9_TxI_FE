import { createRoute } from "@tanstack/react-router";
import { Route as eventsIdRoute } from "../$id";
import PreRegistrationPage from "@/pages/PreRegistrationPage";

export const Route = createRoute({
  getParentRoute: () => eventsIdRoute,
  path: "register",
  component: PreRegistrationPage,
});
