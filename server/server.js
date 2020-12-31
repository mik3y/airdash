const { App, logger } = require('./app');
const Settings = require('./settings');

const getConfig = () => {
  const config = {
    listenPort: Number.parseInt(process.env.PORT || 4000, 10),
  };

  if (!Number.isFinite(config.listenPort)) {
    throw new Error(`Bad value for PORT: "${process.env.PORT}"`);
  }

  return config;
};

async function main() {
  logger.info('Server starting ...');

  const config = getConfig();
  logger.info(`config: ${JSON.stringify(config)}`);

  await Settings.load();

  const app = App({});
  app.listen(config.listenPort);
}

main();