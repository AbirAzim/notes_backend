import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { mailService } from '../src/modules/mail/mail.service';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers';

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(disconnectTestDb);

const api = '/api/v1';
const abir = { name: 'Abir', email: 'abir@test.local', password: 'supersecret1' };

describe('auth', () => {
  it('register → blocked until verified → verify → login', async () => {
    const mail = vi.spyOn(mailService, 'sendVerification').mockResolvedValue(undefined);

    const reg = await request(app).post(`${api}/auth/register`).send(abir);
    expect(reg.status).toBe(201);

    const before = await request(app)
      .post(`${api}/auth/login`)
      .send({ email: abir.email, password: abir.password });
    expect(before.status).toBe(403);

    const token = mail.mock.calls[0][1];
    const verify = await request(app).post(`${api}/auth/verify-email`).send({ token });
    expect(verify.status).toBe(200);

    const login = await request(app)
      .post(`${api}/auth/login`)
      .send({ email: abir.email, password: abir.password });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toEqual(expect.any(String));
    expect(login.body.user.password).toBeUndefined();
    expect(login.headers['cache-control']).toBe('no-store');
  });

  it('rejects role injection on register', async () => {
    const res = await request(app)
      .post(`${api}/auth/register`)
      .send({ ...abir, role: 'ADMIN' });
    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email with 409', async () => {
    vi.spyOn(mailService, 'sendVerification').mockResolvedValue(undefined);
    await request(app).post(`${api}/auth/register`).send(abir);
    const dup = await request(app).post(`${api}/auth/register`).send(abir);
    expect(dup.status).toBe(409);
  });

  it('gives the same 401 for a wrong password and an unknown email', async () => {
    const wrong = await request(app)
      .post(`${api}/auth/login`)
      .send({ email: abir.email, password: 'nope12345' });
    const unknown = await request(app)
      .post(`${api}/auth/login`)
      .send({ email: 'x@test.local', password: 'nope12345' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it('rejects a tampered verification token', async () => {
    const res = await request(app).post(`${api}/auth/verify-email`).send({ token: 'a.b.c' });
    expect(res.status).toBe(400);
  });

  it('requires a valid token on protected routes', async () => {
    expect((await request(app).get(`${api}/users/me`)).status).toBe(401);
    expect(
      (await request(app).get(`${api}/users/me`).set('Authorization', 'Bearer bad')).status,
    ).toBe(401);
  });

  it('returns 400 for malformed JSON with a request id', async () => {
    const res = await request(app)
      .post(`${api}/auth/login`)
      .set('Content-Type', 'application/json')
      .send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.requestId).toEqual(expect.any(String));
  });
});
