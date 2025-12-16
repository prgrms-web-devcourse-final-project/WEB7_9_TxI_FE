import { createRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./__root";
import MyPage from "@/pages/MyPage";
import { requireAuth } from "@/utils/auth";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-page",
  beforeLoad: ({ location }) => requireAuth(location),
  component: MyPage,
});
