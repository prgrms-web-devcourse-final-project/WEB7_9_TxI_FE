import { createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as indexRoute } from "./routes/index";
import { Route as faqRoute } from "./routes/faq";
import { Route as eventsRoute } from "./routes/events";
import { Route as eventDetailRoute } from "./routes/events/$id";
import { Route as eventRegisterRoute } from "./routes/events/$id/register";
import { Route as eventQueueRoute } from "./routes/events/$id/queue";
import { Route as myTicketsRoute } from "./routes/my-tickets";
import { Route as myTicketDetailRoute } from "./routes/my-tickets/$ticketId";
import { Route as myPageRoute } from "./routes/my-page";

const routeTree = rootRoute.addChildren([
  indexRoute,
  faqRoute,
  eventsRoute,
  eventDetailRoute,
  eventRegisterRoute,
  eventQueueRoute,
  myTicketsRoute,
  myTicketDetailRoute,
  myPageRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
