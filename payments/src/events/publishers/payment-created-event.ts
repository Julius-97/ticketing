import { PaymentCreatedEvent, Publisher, Subjects } from "@j97tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
}