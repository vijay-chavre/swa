const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const express = require('express');

const config = require('./config/webpack.config.dev');

const app = express();
const port = process.env.PORT || 3000;
const ENV = require('./config/env/local');

const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
app.use(webpackHotMiddleware(compiler));
console.log(ENV);
app.use('', express.static(`${__dirname}/static`));

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/static/index.html`);
});

app.listen(port, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.info('==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
  }
});
