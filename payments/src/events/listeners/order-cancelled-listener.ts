import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@j97tickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = process.env.QUEUE_GROUP_NAME!;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent(data);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled, version: data.version });
    await order.save();

    msg.ack();
  }
}
