process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-that-is-at-least-32-chars';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-that-is-at-least-32-chars';
process.env.AI_SERVICE_TOKEN ??= 'test-internal-token-123';
process.env.AI_SERVICE_URL ??= 'http://127.0.0.1:1'; // unreachable unless a test mocks the client
process.env.UPLOAD_DIR ??= 'tests/.uploads';
process.env.LOG_LEVEL = 'silent';
