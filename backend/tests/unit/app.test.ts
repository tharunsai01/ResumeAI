/** HTTP-level checks that do not need a database. */
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';

const app = createApp();

describe('HTTP surface', () => {
  it('returns standard 404 errors', async () => {
    const res = await request(app).get('/api/v1/nope');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: { code: 'ROUTE_NOT_FOUND' } });
  });

  it('sets security headers', async () => {
    const res = await request(app).get('/api/v1/auth/providers');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
  });

  it('reports OAuth providers as unconfigured without credentials', async () => {
    const res = await request(app).get('/api/v1/auth/providers');
    expect(res.body.data).toEqual({ google: false, linkedin: false });
    const start = await request(app).get('/api/v1/auth/oauth/google');
    expect(start.status).toBe(501);
  });

  it('requires authentication on protected routes', async () => {
    expect((await request(app).get('/api/v1/candidates/me')).status).toBe(401);
    const bad = await request(app).get('/api/v1/admin/users').set('Authorization', 'Bearer not-a-token');
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('TOKEN_INVALID');
  });

  it('rejects cookie endpoints without the CSRF header', async () => {
    expect((await request(app).post('/api/v1/auth/refresh')).status).toBe(403);
  });

  it('validates bodies before touching the database', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'bad', password: 'x', role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details.length).toBeGreaterThan(1);
  });

  it('handles malformed JSON', async () => {
    const res = await request(app).post('/api/v1/auth/login').set('Content-Type', 'application/json').send('{"email":');
    expect(res.status).toBe(400);
  });

  it('rejects CORS from unknown origins', async () => {
    const res = await request(app).options('/api/v1/auth/login').set('Origin', 'https://evil.example').set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    const okRes = await request(app).options('/api/v1/auth/login').set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'POST');
    expect(okRes.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
