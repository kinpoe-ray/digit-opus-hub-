import express, { Express } from 'express';
import { Server } from 'http';

const originalEnv = process.env;

const loadRateLimiter = async (env: NodeJS.ProcessEnv = {}) => {
  jest.resetModules();
  process.env = { ...originalEnv, ...env };

  const { rateLimiter } = await import('./rateLimiter');
  return rateLimiter;
};

const listen = (app: Express) =>
  new Promise<{ server: Server; url: string }>((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Unable to determine test server port'));
        return;
      }

      resolve({
        server,
        url: `http://127.0.0.1:${address.port}`,
      });
    });
  });

const closeServer = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close(error => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const createTestApp = async (env?: NodeJS.ProcessEnv) => {
  const app = express();
  app.use(await loadRateLimiter(env));
  app.get('/ping', (_req, res) => {
    res.json({ ok: true });
  });

  return app;
};

describe('rateLimiter', () => {
  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 429 after the configured request limit is exceeded', async () => {
    const app = await createTestApp({
      RATE_LIMIT_WINDOW_MS: '60000',
      RATE_LIMIT_MAX_REQUESTS: '2',
    });
    const { server, url } = await listen(app);

    try {
      expect((await fetch(`${url}/ping`)).status).toBe(200);
      expect((await fetch(`${url}/ping`)).status).toBe(200);

      const response = await fetch(`${url}/ping`);
      await expect(response.json()).resolves.toEqual({
        error: 'Too many requests, please try again later.',
      });
      expect(response.status).toBe(429);
    } finally {
      await closeServer(server);
    }
  });

  it('falls back to the default maximum when the environment value is invalid', async () => {
    const app = await createTestApp({
      RATE_LIMIT_WINDOW_MS: 'invalid',
      RATE_LIMIT_MAX_REQUESTS: 'invalid',
    });
    const { server, url } = await listen(app);

    try {
      for (let requestCount = 0; requestCount < 100; requestCount += 1) {
        expect((await fetch(`${url}/ping`)).status).toBe(200);
      }

      expect((await fetch(`${url}/ping`)).status).toBe(429);
    } finally {
      await closeServer(server);
    }
  });
});
