import db from '../db.js';

const yearMonthPattern = '^[0-9]{4}-(0[1-9]|1[0-2])$';

export default async function monthsRoutes(fastify) {
  fastify.get('/api/months', async (req, reply) => {
    const result = await db.execute(
      `SELECT month_ref,
              SUM(amount) AS total,
              SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
              SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending,
              COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pendingCount
       FROM bills
       GROUP BY month_ref
       ORDER BY month_ref DESC`
    );
    return result.rows;
  });

  fastify.get(
    '/api/months/:yearMonth/summary',
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
      const result = await db.execute({
        sql: `SELECT
         COALESCE(SUM(amount), 0) AS total,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pendingCount
       FROM bills
       WHERE month_ref = ?`,
        args: [yearMonth],
      });
      return result.rows[0];
    }
  );

  fastify.post(
    '/api/months/:yearMonth/duplicate-from/:sourceYearMonth',
    {
      schema: {
        params: {
          type: 'object',
          required: ['yearMonth', 'sourceYearMonth'],
          properties: {
            yearMonth: { type: 'string', pattern: yearMonthPattern },
            sourceYearMonth: { type: 'string', pattern: yearMonthPattern },
          },
        },
      },
    },
    async (req, reply) => {
      const { yearMonth, sourceYearMonth } = req.params;

      const source = await db.execute({
        sql: `SELECT * FROM bills WHERE month_ref = ? ORDER BY sort_order ASC, created_at ASC`,
        args: [sourceYearMonth],
      });

      if (source.rows.length === 0) {
        return reply.code(422).send({ error: 'No bills found in source month' });
      }

      const statements = source.rows.map((bill) => ({
        sql: `INSERT INTO bills (name, amount, month_ref, status, sort_order) VALUES (?, ?, ?, 'pending', ?)`,
        args: [bill.name, bill.amount, yearMonth, bill.sort_order],
      }));

      await db.batch(statements, 'write');

      const created = await db.execute({
        sql: `SELECT * FROM bills WHERE month_ref = ? ORDER BY sort_order ASC, created_at ASC`,
        args: [yearMonth],
      });

      reply.code(201).send(created.rows);
    }
  );
}
