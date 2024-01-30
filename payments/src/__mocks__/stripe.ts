import Stripe from 'stripe';

export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({ id: 'some_stripe_id_'+(Math.random() + 1).toString(36).substring(7) }),
  },
};
