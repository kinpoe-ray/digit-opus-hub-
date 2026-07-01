import request from 'supertest';
import { createApp } from '../app';

describe('GET /health', () => {
  it('returns an ok status with a timestamp', async () => {
    const app = createApp({ includeApiRoutes: false });
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});
