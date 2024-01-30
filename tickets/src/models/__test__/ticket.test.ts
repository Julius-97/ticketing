import { Ticket } from '../ticket';

it('implements optimistic concurrecny protocol', async () => {
  // Create an istance of the ticket

  const ticket = Ticket.build({
    title: 'concert',
    price: '5',
    userId: '123',
  });

  // Save the ticket to the DB

  await ticket.save();

  // Fetch the ticket twice

  const firstIntance = await Ticket.findById(ticket.id);
  const secondIntance = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched

  firstIntance?.set({ price: '10' });
  secondIntance?.set({ price: '20' });

  // Save the first fetched ticket
  await firstIntance?.save();

  // save the second fetched ticket and expect an error
  try {
    await secondIntance?.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: '20',
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
