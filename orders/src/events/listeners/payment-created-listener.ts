import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@j97tickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = process.env.QUEUE_GROUP_NAME!;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    msg.ack();
  }
}
