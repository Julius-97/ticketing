import request from 'supertest';

import { app } from '../../app';

const createTicket = (newTicket: { title: string; price: string }) => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send(newTicket)
    .expect(201);
};

it('can fetch a list of tickets', async () => {
  await createTicket({ title: 'afss', price: '10.5' });
  await createTicket({ title: 'afadca', price: '10.5' });
  await createTicket({ title: 'afdsdvs', price: '10.5' });

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
