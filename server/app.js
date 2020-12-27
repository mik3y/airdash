const Koa = require("koa");
const Router = require("koa-router");
const views = require("koa-views");
const koaStatic = require("koa-static");
const mount = require("koa-mount");
const fs = require("fs");
const winston = require("winston");
const koaLogger = require("koa2-winston").logger;

const ConnectionManager = require("./connection-manager");

const TEMPLATE_DIR = `${__dirname}/templates`;
const ASSET_PATH_PREFIX = "/assets/bundles";
const ASSET_DIR = `${__dirname}/../webpack/dist/app`;

let CSS_BUNDLE_URL;
let JS_BUNDLE_URL;

if (process.env.WEBPACK_TARGET === "local") {
  // In dev, use automagic (in-memory) webpack-dev-server output filenames.
  CSS_BUNDLE_URL = "/loader.css";
  JS_BUNDLE_URL = "/loader.js";
} else {
  // In prod, load bundle files from webpack output filenames.
  // If erroring below, it means someone forgot to `build-prod`.
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const manifestFile = require(`${ASSET_DIR}/webpack-assets.json`);

  const cssFilePath = `${ASSET_DIR}/${manifestFile.loader.css}`;
  if (!fs.existsSync(cssFilePath)) {
    throw new Error(`CSS bundle file not found: ${cssFilePath}`);
  }
  CSS_BUNDLE_URL = `${ASSET_PATH_PREFIX}/${manifestFile.loader.css}`;

  const jsFilePath = `${ASSET_DIR}/${manifestFile.loader.js}`;
  if (!fs.existsSync(jsFilePath)) {
    throw new Error(`JS bundle file not found: ${jsFilePath}`);
  }
  JS_BUNDLE_URL = `${ASSET_PATH_PREFIX}/${manifestFile.loader.js}`;
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

  const connections = new ConnectionManager();

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

  app.use(mount(ASSET_PATH_PREFIX, koaStatic(ASSET_DIR)));
  app.use(mount("/static/app", koaStatic(ASSET_DIR)));

  const router = new Router();

  router.use(
    views(TEMPLATE_DIR, {
      map: {
        html: "nunjucks",
      },
    })
  );

  router.get("/test", async (ctx) => {
    ctx.state = { CSS_BUNDLE_URL, JS_BUNDLE_URL };
    ctx.set("Cache-Control", "public, max-age=60");
    ctx.set("X-Xss-Protection", "1; mode=block");
    await ctx.render("index.html");
  });

  router.get("/api/sources/ais/:hostname/:port", async (ctx) => {
    const { hostname, port } = ctx.params;
    const updates = connections.getAISData(hostname, port);
    if (!updates) {
      ctx.status = 404;
    }
    ctx.body = {
      updates: mapToObject(updates),
    };
  });

  router.post("/api/sources/ais/:hostname/:port", async (ctx) => {
    const { hostname, port } = ctx.params;
    const updates = connections.getAISData(hostname, port);
    if (updates) {
      ctx.status = 409;
      ctx.body = {
        status: "error",
        error: {
          message: "Already connected",
        },
      };
      return;
    }
    connections.addAISConnection(hostname, port);
    ctx.body = {
      status: "ok",
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
