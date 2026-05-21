import { env } from '../config/env.js';

export const notFound = (_req, res) => {
  res.status(404).send({ message: 'Not Found' });
};

export const errorHandler = (err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send({
    message: env.nodeEnv === 'production' ? 'Internal Server Error' : err.message,
  });
};
