// ES module
import logger from '../utils/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info({
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      time: new Date().toISOString(),
    });
  });

  next();
};

export default requestLogger;
