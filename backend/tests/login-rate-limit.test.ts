import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';

test('the production login route returns 429 after repeated invalid logins', async () => {
  assert.equal(process.env.NODE_ENV, 'test', 'Run only in the isolated backend test environment');
  assert.ok(process.env.MONGODB_URI, 'Provide the isolated test database explicitly');

  process.env.NODE_ENV = 'production';
  const { app } = await import('../src/app');
  const { connectDB, disconnectDB } = await import('../src/config/db');

  await connectDB();
  const server = app.listen(0, '127.0.0.1');
  try {
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}/api/v1/auth`;
    const email = `limit-${randomUUID()}@example.test`;
    const send = (path: string, payload: unknown) => fetch(origin + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    for (let attempt = 0; attempt < 20; attempt++) {
      const response = await send('/login', { email, password: 'Invalid-test-password1!' });
      assert.equal(response.status, 401, `Attempt ${attempt + 1}`);
      await response.arrayBuffer();
    }
    const blocked = await send('/login', { email, password: 'Invalid-test-password1!' });
    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers.get('retry-after'));
    await blocked.arrayBuffer();

    const otherAuthRoute = await send('/register', {});
    assert.equal(otherAuthRoute.status, 400, 'Login requests must not exhaust the registration limiter');
    await otherAuthRoute.arrayBuffer();
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    await disconnectDB();
  }
});
