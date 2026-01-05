import { createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as faqRoute } from "./routes/faq";
import { Route as eventsRoute } from "./routes/events";
import { Route as eventDetailRoute } from "./routes/events/$id";
import { Route as eventRegisterRoute } from "./routes/events/$id/register";
import { Route as eventQueueRoute } from "./routes/events/$id/queue";
import { Route as myTicketsRoute } from "./routes/my-tickets";
import { Route as myPageRoute } from "./routes/my-page";
import { Route as ticketsVerifyRoute } from "./routes/tickets.verify";
import { Route as paymentSuccessRoute } from "./routes/payment-success";
import { Route as adminRoute } from "./routes/admin";
import { Route as adminQueueRoute } from "./routes/admin/queue.$eventId";
import { Route as adminSeatsRoute } from "./routes/admin/seats.$eventId";
import { Route as adminEventRoute } from "./routes/admin/events.$eventId";
import { Route as adminEventEditRoute } from "./routes/admin/events.$eventId.edit";
import { Route as adminEventNewRoute } from "./routes/admin/events.new";
import { Route as oauthCallbackRoute } from "./routes/oauth-callback";

const routeTree = rootRoute.addChildren([
  indexRoute,
  faqRoute,
  eventsRoute,
  eventDetailRoute,
  eventRegisterRoute,
  eventQueueRoute,
  myTicketsRoute,
  myPageRoute,
  ticketsVerifyRoute,
  paymentSuccessRoute,
  adminRoute,
  adminQueueRoute,
  adminSeatsRoute,
  adminEventRoute,
  adminEventEditRoute,
  adminEventNewRoute,
  oauthCallbackRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
