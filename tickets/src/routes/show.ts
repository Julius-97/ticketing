import express, { RequestHandler } from 'express';

import { NotFoundError } from '@j97tickets/common';

import { Ticket } from '../models';

const router = express.Router();

router.get('/api/tickets/:id', (async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.json(ticket);
}) as RequestHandler);

export { router as showTicketRouter };
