import { Publisher, Subjects, TicketUpdatedEvent } from '@j97tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
