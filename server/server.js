const { App, logger } = require('./app');

const getConfig = () => {
  const config = {
    upstreamApiBaseUrl: process.env.UPSTREAM_URL || 'http://localhost:9000',
    listenPort: Number.parseInt(process.env.PORT || 4000, 10),
  };

  if (!Number.isFinite(config.listenPort)) {
    throw new Error(`Bad value for PORT: "${process.env.PORT}"`);
  }

  if (!config.upstreamApiBaseUrl) {
    throw new Error('Must specify UPSTREAM_URL');
  }

  return config;
};

logger.info('Server starting ...');

const config = getConfig();
logger.info(`config: ${JSON.stringify(config)}`);

const app = App({ upstreamApiBaseUrl: config.upstreamApiBaseUrl });
app.listen(config.listenPort);
