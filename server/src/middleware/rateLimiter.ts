import { Request, Response, NextFunction } from 'express';

export const rateLimiter = (
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  // TODO: 实现真实的限流逻辑
  next();
};
