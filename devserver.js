const webpack = require('webpack');
const config = require('./config/webpack.config');
const koaWebpack = require('koa-webpack');
const { App } = require('./server/app');

const { WEBPACK_TARGET, NODE_ENV } = process.env;

async function main() {
  if (WEBPACK_TARGET !== 'local') {
    throw new Error('devserver should only be run with WEBPACK_TARGET=local');
  }

  const compiler = webpack(config(NODE_ENV));
  const koaWebpackMiddleware = await koaWebpack({ compiler });

  const app = App({
    initialMiddleware: koaWebpackMiddleware
  });

  app.listen(4000);
}

main();
