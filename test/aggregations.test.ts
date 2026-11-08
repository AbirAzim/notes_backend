import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { connectTestDb, clearTestDb, disconnectTestDb, createUser } from './helpers';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(disconnectTestDb);

const api = '/api/v1';

describe('scenario 1: users grouped by interests', () => {
  it('groups, counts, sorts and filters', async () => {
    const abir = await createUser('Abir', 'USER', ['chess', 'reading', 'music']);
    await createUser('Admin', 'ADMIN', ['chess', 'hiking']);
    const auth = { Authorization: `Bearer ${abir.token}` };

    const all = await request(app).get(`${api}/users/grouped-by-interests`).set(auth);
    expect(all.status).toBe(200);
    expect(all.body.total).toBe(4);
    expect(all.body.data[0]).toMatchObject({ interest: 'chess', count: 2 });

    const filtered = await request(app)
      .get(`${api}/users/grouped-by-interests?interests=Chess,%20MUSIC`)
      .set(auth);
    expect(filtered.body.data.map((g: { interest: string }) => g.interest)).toEqual([
      'chess',
      'music',
    ]);
  });
});

describe("scenario 2: a user's posts via $lookup", () => {
  it('returns the user and paginated posts, with edit links only for the author', async () => {
    const author = await createUser('Abir');
    const viewer = await createUser('Viewer');
    for (const t of ['p1', 'p2', 'p3']) {
      await request(app)
        .post(`${api}/posts`)
        .set('Authorization', `Bearer ${author.token}`)
        .send({ title: t, body: 'b' });
    }

    const url = `${api}/users/${author.id}/posts?limit=2`;
    const asAuthor = await request(app).get(url).set('Authorization', `Bearer ${author.token}`);
    expect(asAuthor.status).toBe(200);
    expect(asAuthor.body.user.name).toBe('Abir');
    expect(asAuthor.body.total).toBe(3);
    expect(asAuthor.body.data.map((p: { title: string }) => p.title)).toEqual(['p3', 'p2']);
    expect(asAuthor.body.data[0]._links.update).toBeDefined();

    const asViewer = await request(app).get(url).set('Authorization', `Bearer ${viewer.token}`);
    expect(asViewer.body.data[0]._links.update).toBeUndefined();
  });

  it('returns 404 for an unknown user', async () => {
    const viewer = await createUser('Viewer');
    const res = await request(app)
      .get(`${api}/users/6aeff85f053f00bb739c87fe/posts`)
      .set('Authorization', `Bearer ${viewer.token}`);
    expect(res.status).toBe(404);
  });
});
