import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { Note } from '../src/modules/notes/note.model';
import { Post } from '../src/modules/posts/post.model';
import { connectTestDb, clearTestDb, disconnectTestDb, createUser } from './helpers';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(disconnectTestDb);

const api = '/api/v1';

describe('admin', () => {
  it('rejects missing token (401) and non-admins (403)', async () => {
    const user = await createUser('Abir');
    expect((await request(app).get(`${api}/admin/users`)).status).toBe(401);
    expect(
      (await request(app).get(`${api}/admin/users`).set('Authorization', `Bearer ${user.token}`))
        .status,
    ).toBe(403);
  });

  it('lets an admin change role but not email or password', async () => {
    const admin = await createUser('Admin', 'ADMIN');
    const user = await createUser('Abir');
    const url = `${api}/admin/users/${user.id}`;
    const auth = { Authorization: `Bearer ${admin.token}` };

    const promoted = await request(app).patch(url).set(auth).send({ role: 'ADMIN' });
    expect(promoted.status).toBe(200);
    expect(promoted.body.role).toBe('ADMIN');

    expect((await request(app).patch(url).set(auth).send({ email: 'x@test.local' })).status).toBe(
      400,
    );
    expect((await request(app).patch(url).set(auth).send({ password: 'newpass123' })).status).toBe(
      400,
    );
  });

  it('prevents admins from deleting or demoting themselves', async () => {
    const admin = await createUser('Admin', 'ADMIN');
    const url = `${api}/admin/users/${admin.id}`;
    const auth = { Authorization: `Bearer ${admin.token}` };
    expect((await request(app).delete(url).set(auth)).status).toBe(400);
    expect((await request(app).patch(url).set(auth).send({ role: 'USER' })).status).toBe(400);
  });

  it('deletes a user together with their notes and posts', async () => {
    const admin = await createUser('Admin', 'ADMIN');
    const user = await createUser('Abir');
    const asUser = { Authorization: `Bearer ${user.token}` };
    await request(app).post(`${api}/notes`).set(asUser).send({ title: 'n1' });
    await request(app).post(`${api}/posts`).set(asUser).send({ title: 'p1', body: 'b' });

    const res = await request(app)
      .delete(`${api}/admin/users/${user.id}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(204);

    expect(await Note.countDocuments({ owner: user.id })).toBe(0);
    expect(await Post.countDocuments({ author: user.id })).toBe(0);
  });
});
