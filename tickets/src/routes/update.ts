import express, { RequestHandler } from 'express';
import { body, param } from 'express-validator';

import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from '@j97tickets/common';

import { Ticket } from '../models';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    param('id').isAlphanumeric(),
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  (async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    const { title: newTitle, price: newPrice } = req.body;

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError('Cannot edit a reseved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({ title: newTitle, price: newPrice });

    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: parseFloat(ticket.price),
      userId: ticket.userId,
      version: ticket.version,
    });

    res.json(ticket);
  }) as RequestHandler,
);

export { router as updateTicketRouter };
