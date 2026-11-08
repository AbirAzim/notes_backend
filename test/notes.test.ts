import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { connectTestDb, clearTestDb, disconnectTestDb, createUser } from './helpers';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(disconnectTestDb);

const api = '/api/v1';

describe('notes', () => {
  it('creates with 201 + Location and lists newest first with pagination links', async () => {
    const { token } = await createUser('Abir');
    const auth = { Authorization: `Bearer ${token}` };

    const created = await request(app).post(`${api}/notes`).set(auth).send({ title: 'First' });
    expect(created.status).toBe(201);
    expect(created.headers.location).toBe(`${api}/notes/${created.body._id}`);

    await request(app).post(`${api}/notes`).set(auth).send({ title: 'Second' });
    await request(app).post(`${api}/notes`).set(auth).send({ title: 'Third' });

    const list = await request(app).get(`${api}/notes?limit=2`).set(auth);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(3);
    expect(list.body.totalPages).toBe(2);
    expect(list.body.data.map((n: { title: string }) => n.title)).toEqual(['Third', 'Second']);
    expect(list.body._links.next).toBeDefined();
    expect(list.body._links.prev).toBeUndefined();
  });

  it("returns 404 for another user's note on get, update and delete", async () => {
    const owner = await createUser('Owner');
    const other = await createUser('Other');
    const note = await request(app)
      .post(`${api}/notes`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'Private' });

    const url = `${api}/notes/${note.body._id}`;
    const asOther = { Authorization: `Bearer ${other.token}` };
    expect((await request(app).get(url).set(asOther)).status).toBe(404);
    expect((await request(app).patch(url).set(asOther).send({ title: 'x' })).status).toBe(404);
    expect((await request(app).delete(url).set(asOther)).status).toBe(404);

    // still there for the owner
    expect((await request(app).get(url).set('Authorization', `Bearer ${owner.token}`)).status).toBe(
      200,
    );
  });

  it('answers 304 when the ETag matches', async () => {
    const { token } = await createUser('Abir');
    const auth = { Authorization: `Bearer ${token}` };
    await request(app).post(`${api}/notes`).set(auth).send({ title: 'Cached' });

    const first = await request(app).get(`${api}/notes`).set(auth);
    expect(first.headers['cache-control']).toBe('private, no-cache');

    const second = await request(app)
      .get(`${api}/notes`)
      .set(auth)
      .set('If-None-Match', first.headers.etag);
    expect(second.status).toBe(304);
  });

  it('rejects an invalid id and an owner field in the body', async () => {
    const { token } = await createUser('Abir');
    const auth = { Authorization: `Bearer ${token}` };
    expect((await request(app).get(`${api}/notes/abc`).set(auth)).status).toBe(400);
    expect(
      (await request(app).post(`${api}/notes`).set(auth).send({ title: 'x', owner: 'y' })).status,
    ).toBe(400);
  });
});
