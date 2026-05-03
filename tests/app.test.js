import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const tempDir = await mkdtemp(join(tmpdir(), 'bill-track-tests-'));
process.env.BILLTRACK_DB_PATH = join(tempDir, 'bill-track.test.db');

const [{ buildApp }, { default: db }] = await Promise.all([
  import('../src/app.js'),
  import('../src/db.js'),
]);

function readJson(response) {
  return JSON.parse(response.payload);
}

async function createBill(app, yearMonth, overrides = {}) {
  const response = await app.inject({
    method: 'POST',
    url: `/api/months/${yearMonth}/bills`,
    payload: {
      name: 'Sample bill',
      amount: 100,
      ...overrides,
    },
  });

  expect(response.statusCode).toBe(201);
  return readJson(response);
}

describe('BillTrack API', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp();
  });

  beforeEach(() => {
    db.exec('DELETE FROM bills');
    db.exec("DELETE FROM sqlite_sequence WHERE name = 'bills'");
  });

  afterAll(async () => {
    await app.close();
    db.close();
    await rm(tempDir, { recursive: true, force: true });
    delete process.env.BILLTRACK_DB_PATH;
  });

  test('creates bills, updates status, and filters by status', async () => {
    const firstBill = await createBill(app, '2026-05', {
      name: 'Rent',
      amount: 1800,
    });
    const secondBill = await createBill(app, '2026-05', {
      name: 'Internet',
      amount: 120,
    });

    expect(firstBill.status).toBe('pending');
    expect(firstBill.month_ref).toBe('2026-05');

    const patchResponse = await app.inject({
      method: 'PATCH',
      url: `/api/bills/${firstBill.id}`,
      payload: {
        name: 'Paid rent',
        status: 'paid',
      },
    });

    expect(patchResponse.statusCode).toBe(200);
    expect(readJson(patchResponse)).toMatchObject({
      id: firstBill.id,
      name: 'Paid rent',
      status: 'paid',
    });

    const paidResponse = await app.inject({
      method: 'GET',
      url: '/api/months/2026-05/bills?status=paid',
    });
    const pendingResponse = await app.inject({
      method: 'GET',
      url: '/api/months/2026-05/bills?status=pending',
    });

    expect(paidResponse.statusCode).toBe(200);
    expect(readJson(paidResponse)).toHaveLength(1);
    expect(readJson(paidResponse)[0].id).toBe(firstBill.id);

    expect(pendingResponse.statusCode).toBe(200);
    expect(readJson(pendingResponse)).toHaveLength(1);
    expect(readJson(pendingResponse)[0].id).toBe(secondBill.id);
  });

  test('returns validation errors and missing resource errors', async () => {
    const invalidCreateResponse = await app.inject({
      method: 'POST',
      url: '/api/months/2026-05/bills',
      payload: {
        amount: 50,
      },
    });

    expect(invalidCreateResponse.statusCode).toBe(400);
    expect(readJson(invalidCreateResponse)).toEqual(
      expect.objectContaining({
        error: expect.any(String),
      })
    );

    const notFoundPatchResponse = await app.inject({
      method: 'PATCH',
      url: '/api/bills/9999',
      payload: {
        status: 'paid',
      },
    });

    expect(notFoundPatchResponse.statusCode).toBe(404);
    expect(readJson(notFoundPatchResponse)).toEqual({ error: 'Not found' });

    const bill = await createBill(app, '2026-05', {
      name: 'Water',
      amount: 75,
    });

    const invalidAmountResponse = await app.inject({
      method: 'PATCH',
      url: `/api/bills/${bill.id}`,
      payload: {
        amount: -10,
      },
    });

    expect(invalidAmountResponse.statusCode).toBe(400);
    expect(readJson(invalidAmountResponse)).toEqual({
      error: 'Amount must be a positive number',
    });

    const invalidStatusResponse = await app.inject({
      method: 'PATCH',
      url: `/api/bills/${bill.id}`,
      payload: {
        status: 'overdue',
      },
    });

    expect(invalidStatusResponse.statusCode).toBe(400);
    expect(readJson(invalidStatusResponse)).toEqual({ error: 'Invalid status' });
  });

  test('builds monthly summary and aggregated month list', async () => {
    const mayPaid = await createBill(app, '2026-05', {
      name: 'Electricity',
      amount: 200,
    });
    await createBill(app, '2026-05', {
      name: 'Condo fee',
      amount: 500,
    });
    await createBill(app, '2026-06', {
      name: 'Credit card',
      amount: 900,
    });

    const markAsPaidResponse = await app.inject({
      method: 'PATCH',
      url: `/api/bills/${mayPaid.id}`,
      payload: {
        status: 'paid',
      },
    });

    expect(markAsPaidResponse.statusCode).toBe(200);

    const summaryResponse = await app.inject({
      method: 'GET',
      url: '/api/months/2026-05/summary',
    });

    expect(summaryResponse.statusCode).toBe(200);
    expect(readJson(summaryResponse)).toEqual({
      total: 700,
      paid: 200,
      pending: 500,
      pendingCount: 1,
    });

    const monthsResponse = await app.inject({
      method: 'GET',
      url: '/api/months',
    });

    expect(monthsResponse.statusCode).toBe(200);
    expect(readJson(monthsResponse)).toEqual([
      {
        month_ref: '2026-06',
        total: 900,
        paid: 0,
        pending: 900,
        pendingCount: 1,
      },
      {
        month_ref: '2026-05',
        total: 700,
        paid: 200,
        pending: 500,
        pendingCount: 1,
      },
    ]);
  });

  test('duplicates bills from one month to another resetting status', async () => {
    const firstBill = await createBill(app, '2026-03', {
      name: 'School',
      amount: 650,
    });
    await createBill(app, '2026-03', {
      name: 'Health insurance',
      amount: 430,
    });

    const paidResponse = await app.inject({
      method: 'PATCH',
      url: `/api/bills/${firstBill.id}`,
      payload: {
        status: 'paid',
      },
    });

    expect(paidResponse.statusCode).toBe(200);

    const duplicateResponse = await app.inject({
      method: 'POST',
      url: '/api/months/2026-04/duplicate-from/2026-03',
    });

    expect(duplicateResponse.statusCode).toBe(201);
    expect(readJson(duplicateResponse)).toEqual([
      expect.objectContaining({
        name: 'School',
        amount: 650,
        month_ref: '2026-04',
        status: 'pending',
      }),
      expect.objectContaining({
        name: 'Health insurance',
        amount: 430,
        month_ref: '2026-04',
        status: 'pending',
      }),
    ]);
  });

  test('deletes bills and blocks duplication without a source month', async () => {
    const bill = await createBill(app, '2026-07', {
      name: 'Streaming',
      amount: 35,
    });

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/bills/${bill.id}`,
    });

    expect(deleteResponse.statusCode).toBe(204);

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/months/2026-07/bills',
    });

    expect(readJson(listResponse)).toEqual([]);

    const duplicateWithoutSourceResponse = await app.inject({
      method: 'POST',
      url: '/api/months/2026-08/duplicate-from/2026-01',
    });

    expect(duplicateWithoutSourceResponse.statusCode).toBe(422);
    expect(readJson(duplicateWithoutSourceResponse)).toEqual({
      error: 'No bills found in source month',
    });
  });
});
