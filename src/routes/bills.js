import db from '../db.js';

export default async function billsRoutes(fastify) {
  fastify.get('/api/months/:yearMonth/bills', (req, reply) => {
    const { yearMonth } = req.params;
    const { status } = req.query;
    let stmt;
    if (status === 'pending' || status === 'paid') {
      stmt = db.prepare(
        `SELECT * FROM bills WHERE month_ref = ? AND status = ? ORDER BY sort_order ASC, created_at ASC`
      );
      return stmt.all(yearMonth, status);
    }
    stmt = db.prepare(
      `SELECT * FROM bills WHERE month_ref = ? ORDER BY sort_order ASC, created_at ASC`
    );
    return stmt.all(yearMonth);
  });

  fastify.post('/api/months/:yearMonth/bills', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'amount'],
        properties: {
          name: { type: 'string', minLength: 1 },
          amount: { type: 'number', minimum: 0 },
        },
      },
    },
  }, (req, reply) => {
    const { yearMonth } = req.params;
    const { name, amount } = req.body;
    const stmt = db.prepare(
      `INSERT INTO bills (name, amount, month_ref, status) VALUES (?, ?, ?, 'pending')`
    );
    const result = stmt.run(name, amount, yearMonth);
    const bill = db.prepare(`SELECT * FROM bills WHERE id = ?`).get(result.lastInsertRowid);
    reply.code(201).send(bill);
  });

  fastify.patch('/api/bills/:id', (req, reply) => {
    const { id } = req.params;
    const { name, amount, status } = req.body;

    const bill = db.prepare(`SELECT * FROM bills WHERE id = ?`).get(id);
    if (!bill) return reply.code(404).send({ error: 'Not found' });

    if (name !== undefined) {
      if (!name || name.trim() === '') return reply.code(400).send({ error: 'Name cannot be empty' });
      db.prepare(`UPDATE bills SET name = ? WHERE id = ?`).run(name.trim(), id);
    }
    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount < 0) return reply.code(400).send({ error: 'Amount must be a positive number' });
      db.prepare(`UPDATE bills SET amount = ? WHERE id = ?`).run(amount, id);
    }
    if (status !== undefined) {
      if (status !== 'pending' && status !== 'paid') return reply.code(400).send({ error: 'Invalid status' });
      db.prepare(`UPDATE bills SET status = ? WHERE id = ?`).run(status, id);
    }

    return db.prepare(`SELECT * FROM bills WHERE id = ?`).get(id);
  });

  fastify.delete('/api/bills/:id', (req, reply) => {
    const { id } = req.params;
    const bill = db.prepare(`SELECT * FROM bills WHERE id = ?`).get(id);
    if (!bill) return reply.code(404).send({ error: 'Not found' });
    db.prepare(`DELETE FROM bills WHERE id = ?`).run(id);
    reply.code(204).send();
  });
}
