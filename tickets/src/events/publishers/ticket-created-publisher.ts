import {Publisher,Subjects, TicketCreatedEvent} from '@j97tickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}