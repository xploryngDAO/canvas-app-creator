import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  const response = {
    success: false,
    error: error.message || 'Internal server error'
  };

  // Handle specific error types
  if (error.name === 'ValidationError') {
    res.status(400).json(response);
    return;
  }

  if (error.name === 'NotFoundError') {
    res.status(404).json(response);
    return;
  }

  // Default to 500 server error
  res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  };

  res.status(404).json(response);
}