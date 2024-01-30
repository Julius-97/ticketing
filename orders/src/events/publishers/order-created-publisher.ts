import { Publisher,OrderCreatedEvent,Subjects } from "@j97tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
};