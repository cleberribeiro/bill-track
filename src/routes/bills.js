import db from '../db.js';

const yearMonthPattern = '^[0-9]{4}-(0[1-9]|1[0-2])$';

export default async function billsRoutes(fastify) {
  fastify.get(
    '/api/months/:yearMonth/bills',
    {
      schema: {
        params: {
          type: 'object',
          required: ['yearMonth'],
          properties: {
            yearMonth: { type: 'string', pattern: yearMonthPattern },
          },
        },
      },
    },
    async (req, reply) => {
      const { yearMonth } = req.params;
      const { status } = req.query;
      if (status === 'pending' || status === 'paid') {
        const result = await db.execute({
          sql: `SELECT * FROM bills WHERE month_ref = ? AND status = ? ORDER BY sort_order ASC, created_at ASC`,
          args: [yearMonth, status],
        });
        return result.rows;
      }
      const result = await db.execute({
        sql: `SELECT * FROM bills WHERE month_ref = ? ORDER BY sort_order ASC, created_at ASC`,
        args: [yearMonth],
      });
      return result.rows;
    }
  );

  fastify.post(
    '/api/months/:yearMonth/bills',
    {
      schema: {
        params: {
          type: 'object',
          required: ['yearMonth'],
          properties: {
            yearMonth: { type: 'string', pattern: yearMonthPattern },
          },
        },
        body: {
          type: 'object',
          required: ['name', 'amount'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            amount: { type: 'number', minimum: 0 },
            status: { type: 'string', enum: ['pending', 'paid'] },
            dueDate: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            notes: { type: 'string', maxLength: 1000 },
          },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const { yearMonth } = req.params;
      const { name, amount } = req.body;
      const result = await db.execute({
        sql: `INSERT INTO bills (name, amount, month_ref, status) VALUES (?, ?, ?, 'pending')`,
        args: [name, amount, yearMonth],
      });
      const created = await db.execute({
        sql: `SELECT * FROM bills WHERE id = ?`,
        args: [Number(result.lastInsertRowid)],
      });
      reply.code(201).send(created.rows[0]);
    }
  );

  fastify.patch(
    '/api/bills/:id',
    {
      attachValidation: true,
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'integer', minimum: 1 },
          },
        },
        body: {
          type: 'object',
          minProperties: 1,
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            amount: { type: 'number', minimum: 0 },
            status: { type: 'string', enum: ['pending', 'paid'] },
          },
        },
      },
    },
    async (req, reply) => {
      if (req.validationError) {
        const [firstError] = req.validationError.validation || [];
        if (firstError?.instancePath === '/amount' && firstError.keyword === 'minimum') {
          return reply.code(400).send({ error: 'Amount must be a positive number' });
        }
        if (firstError?.instancePath === '/status' && firstError.keyword === 'enum') {
          return reply.code(400).send({ error: 'Invalid status' });
        }
        return reply.code(400).send({ error: req.validationError.message });
      }

      const { id } = req.params;
      const { name, amount, status } = req.body;

      const existing = await db.execute({ sql: `SELECT * FROM bills WHERE id = ?`, args: [id] });
      if (existing.rows.length === 0) return reply.code(404).send({ error: 'Not found' });

      if (name !== undefined) {
        await db.execute({ sql: `UPDATE bills SET name = ? WHERE id = ?`, args: [name.trim(), id] });
      }
      if (amount !== undefined) {
        await db.execute({ sql: `UPDATE bills SET amount = ? WHERE id = ?`, args: [amount, id] });
      }
      if (status !== undefined) {
        await db.execute({ sql: `UPDATE bills SET status = ? WHERE id = ?`, args: [status, id] });
      }

      const updated = await db.execute({ sql: `SELECT * FROM bills WHERE id = ?`, args: [id] });
      return updated.rows[0];
    }
  );

  fastify.delete('/api/bills/:id', async (req, reply) => {
    const { id } = req.params;
    const existing = await db.execute({ sql: `SELECT * FROM bills WHERE id = ?`, args: [id] });
    if (existing.rows.length === 0) return reply.code(404).send({ error: 'Not found' });
    await db.execute({ sql: `DELETE FROM bills WHERE id = ?`, args: [id] });
    reply.code(204).send();
  });
}
