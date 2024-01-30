import express, { RequestHandler } from 'express';
import { requireAuth } from '@j97tickets/common';

import { Order } from '../models';

const router = express.Router();

router.get('/api/orders', requireAuth, (async (req, res) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('ticket');

  res.json(orders);
}) as RequestHandler);

export { router as showOrdersRouter };
