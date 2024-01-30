import request from 'supertest';

import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, Payment } from '../../models';
import { OrderStatus } from '@j97tickets/common';
import { stripe } from '../../stripe';

const randomID = mongoose.Types.ObjectId;
jest.mock('../../stripe');

it('return a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'aisdgf',
      orderId: new randomID().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  const order = Order.build({
    id: new randomID().toHexString(),
    price: 99,
    status: OrderStatus.AwaitingPayment,
    userId: new randomID().toHexString(),
    version: 1,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'aisdgf',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new randomID().toHexString();

  const order = Order.build({
    id: new randomID().toHexString(),
    price: 99,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 1,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'aisdgf',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new randomID().toHexString();

  const order = Order.build({
    id: new randomID().toHexString(),
    price: 99,
    status: OrderStatus.AwaitingPayment,
    userId: userId,
    version: 1,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const chargeCalls = (stripe.charges.create as jest.Mock).mock.calls;

  expect(chargeCalls.length).toEqual(1);
  expect(chargeCalls[0].length).toEqual(1);
  expect(chargeCalls[0][0].source).toBeDefined();
  expect(chargeCalls[0][0].amount).toBeDefined();

  expect(chargeCalls[0][0].source).toEqual('tok_visa');
  expect(chargeCalls[0][0].amount).toEqual(order.price * 100);

  const payment = await Payment.findOne({ orderId: order.id });

  expect(payment).not.toBeNull();
});
