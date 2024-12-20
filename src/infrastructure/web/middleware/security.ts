import { Request, Response, NextFunction } from 'express';

export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:* https://*;"
  );
  next();
};