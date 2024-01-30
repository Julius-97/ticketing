import { Publisher, OrderCancelledEvent, Subjects } from '@j97tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
