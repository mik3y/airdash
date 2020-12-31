const Koa = require("koa");
const Router = require("koa-router");
const views = require("koa-views");
const koaStatic = require("koa-static");
const mount = require("koa-mount");
const fs = require("fs");
const winston = require("winston");
const koaLogger = require("koa2-winston").logger;
const bodyParser = require('koa-bodyparser');
const debugLibrary = require("debug");
const debug = debugLibrary("airdash:server");

const ConnectionManager = require("./connection-manager");
const Settings = require('./settings');

const ASSET_DIR = `${__dirname}/../build`;
const STATIC_DIR = `${ASSET_DIR}/static`;

class InvalidRequestError extends Error {
  static status = 400;
}

const stackFormatter = winston.format((info, opts) => {
  if (info.stack) {
    return {
      ...info,
      message: `${info.message}\n${info.stack}`,
      stack: undefined,
    };
  }
  return info;
});

const requestFormatter = winston.format((info, opts) => {
  if (!info.req) {
    return info;
  }
  const { req, res, duration } = info;
  const message = `${res.status} | ${req.method} ${req.url} duration=${duration} for=${req["x-forwarded-for"]} agent=${req.header["user-agent"]}`;
  return {
    ...info,
    message,
    req: undefined,
    res: undefined,
    duration: undefined,
    started_at: undefined,
  };
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    stackFormatter(),
    requestFormatter(),
    winston.format.splat()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      label: "dfe.main",
    }),
  ],
});

const mapToObject = (map) => {
  if (!map) {
    return null;
  }
  const result = Object.create(null);
  map.forEach((value, key) => {
    if (value instanceof Map) {
      result[key] = mapToObject(value);
    } else {
      result[key] = value;
    }
  });
  return result;
};

const App = ({ initialMiddleware }) => {
  const app = new Koa();
  logger.info(`Starting server ...`);

  app.on("error", (err) => {
    logger.error("An uncaught exception was trapped.");
    logger.error(err);
  });

  app.use(
    koaLogger({
      logger,
    })
  );

  if (initialMiddleware) {
    logger.info("Injecting initial middleware ...");
    app.use(initialMiddleware);
  }

  app.use(mount("/static", koaStatic(STATIC_DIR)));

  const router = new Router();

  router.use(bodyParser());
  router.use(views(ASSET_DIR));

  router.get('/', async ctx => {
    ctx.set('Cache-Control', 'no-store');
    ctx.set('X-Xss-Protection', '1; mode=block');
    await ctx.render('index.html');
  });

  const connections = new ConnectionManager();
  if (Settings.dataSources) {
    Settings.dataSources.forEach((uri) => {
      try {
        connections.addDataSource(uri);
        debug(`Added data source ${uri}`)
      } catch (e) {
        console.error(`Error: Failed to add data source ${uri}: ${e}`);
      }
    });
  }

  router.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || err.constructor.status || 500;
      ctx.body = {
        status: 'error',
        error: {
          message: err.toString(),
        },
      };
    }
  });
  
  router.get("/api/data-sources", async (ctx) => {
    const dataSources = connections.getDataSources();
    const result = Object.entries(dataSources).map(([id, dataSource]) => {
      return {
        id,
        type: dataSource.constructor.dataSourceType,
      }
    });
    ctx.body = {
      status: "ok",
      data_sources: result,
    };
  });

  router.post("/api/data-sources", async (ctx) => {
    const { url } = ctx.request.body;
    if (!url) {
      throw new InvalidRequestError('Must provide `url`');
    }
    await connections.addDataSource(url);
    ctx.body = {
      status: "ok",
    };
  });

  router.get("/api/entities", async (ctx) => {
    const entities = Object.fromEntries(connections.entities.keys().map(k => [k, connections.entities.peek(k)]));
    ctx.body = {
      status: "ok",
      entities: entities,
    };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};

module.exports = {
  App,
  logger,
};
