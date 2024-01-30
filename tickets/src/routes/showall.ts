import express, { RequestHandler } from 'express';

import { Ticket } from '../models';

const router = express.Router();

router.get('/api/tickets', (async (req, res) => {
  const tickets = await Ticket.find({orderId: undefined});

  res.json(tickets);
}) as RequestHandler);

export { router as showTicketsRouter };
