import express, { RequestHandler } from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth } from '@j97tickets/common';
import { Order } from '../models';

const router = express.Router();

router.get('/api/orders/:orderId',requireAuth, (async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('ticket');

  if(!order){
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  res.send(order);
}) as RequestHandler);

export { router as showOrderRouter };
