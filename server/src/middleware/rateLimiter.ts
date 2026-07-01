import rateLimit from 'express-rate-limit';

const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 100;

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const rateLimiter = rateLimit({
  windowMs: parsePositiveInteger(
    process.env.RATE_LIMIT_WINDOW_MS,
    DEFAULT_RATE_LIMIT_WINDOW_MS
  ),
  max: parsePositiveInteger(
    process.env.RATE_LIMIT_MAX_REQUESTS,
    DEFAULT_RATE_LIMIT_MAX_REQUESTS
  ),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.',
  },
});
