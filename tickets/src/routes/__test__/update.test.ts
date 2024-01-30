import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models';

const createTicket = (newTicket: { title: string; price: string }) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send(newTicket)
    .expect(201);
};

it('returns a 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put('/api/tickets/' + id)
    .set('Cookie', global.signup())
    .send({ title: 'asffsa', price: '10.5' })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put('/api/tickets/' + id)
    .send({ title: 'asffsa', price: '10.5' })
    .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await createTicket({ title: 'jfno', price: '45.6' });

  await request(app)
    .put('/api/tickets/' + response.body.id)
    .set('Cookie', global.signup())
    .send({ title: 'afnod', price: '12.5' })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signup();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'sdgvas', price: '31.5' })
    .expect(201);

  await request(app)
    .put('/api/tickets/' + response.body.id)
    .set('Cookie', cookie)
    .send({ title: '', price: '-31.5' })
    .expect(400);

  await request(app)
    .put('/api/tickets/' + response.body.id)
    .set('Cookie', cookie)
    .send({ title: 'sdlv', price: '-31.5' })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signup();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'sdgvas', price: '31.5' })
    .expect(201);

  await request(app)
    .put('/api/tickets/' + response.body.id)
    .set('Cookie', cookie)
    .send({ title: 'new title', price: '100' })
    .expect(200);

  const ticketResponse = await request(app)
    .get('/api/tickets/' + response.body.id)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual('new title');
  expect(ticketResponse.body.price).toEqual('100');
});

it('publishes an event', async () => {
  const cookie = global.signup();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'sdgvas', price: '31.5' })
    .expect(201);

  await request(app)
    .put('/api/tickets/' + response.body.id)
    .set('Cookie', cookie)
    .send({ title: 'new title', price: '100' })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signup();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'sdgvas', price: '31.5' })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket?.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket?.save();

  await request(app)
    .put('/api/tickets/' + response.body.id)
    .set('Cookie', cookie)
    .send({ title: 'new title', price: '100' })
    .expect(400);
});
