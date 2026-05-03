import db from '../db.js';

export default async function monthsRoutes(fastify) {
  fastify.get('/api/months', (req, reply) => {
    const months = db.prepare(
      `SELECT month_ref,
              SUM(amount) AS total,
              SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
              SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending,
              COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pendingCount
       FROM bills
       GROUP BY month_ref
       ORDER BY month_ref DESC`
    ).all();
    return months;
  });

  fastify.get('/api/months/:yearMonth/summary', (req, reply) => {
    const { yearMonth } = req.params;
    const row = db.prepare(
      `SELECT
         COALESCE(SUM(amount), 0) AS total,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pendingCount
       FROM bills
       WHERE month_ref = ?`
    ).get(yearMonth);
    return row;
  });

  fastify.post('/api/months/:yearMonth/duplicate-from/:sourceYearMonth', (req, reply) => {
    const { yearMonth, sourceYearMonth } = req.params;

    const sourceBills = db.prepare(
      `SELECT * FROM bills WHERE month_ref = ? ORDER BY sort_order ASC, created_at ASC`
    ).all(sourceYearMonth);

    if (sourceBills.length === 0) {
      return reply.code(422).send({ error: 'No bills found in source month' });
    }

    const insert = db.prepare(
      `INSERT INTO bills (name, amount, month_ref, status, sort_order) VALUES (?, ?, ?, 'pending', ?)`
    );

    const insertMany = db.transaction((bills) => {
      for (const bill of bills) {
        insert.run(bill.name, bill.amount, yearMonth, bill.sort_order);
      }
    });

    insertMany(sourceBills);

    const newBills = db.prepare(
      `SELECT * FROM bills WHERE month_ref = ? ORDER BY sort_order ASC, created_at ASC`
    ).all(yearMonth);

    reply.code(201).send(newBills);
  });
}
