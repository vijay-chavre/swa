const path = require('path');
const webpack = require('webpack');

const env = new webpack.DefinePlugin({
  ENV: JSON.stringify(require(path.join(__dirname, './env/', process.env.NODE_ENV ? process.env.NODE_ENV : 'sandbox'))),
  isViaAfrika: process.env.isViaAfrika || false,

});

module.exports = {
  entry: [
    './src/index.js',
    'webpack/hot/dev-server',
    'webpack-hot-middleware/client',
  ],

  output: {
    path: path.join(__dirname, '..', 'static'),
    publicPath: '/',
    filename: 'app.js',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    env,
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, '..', 'src'),
        options: {
          plugins: [
            ['react-transform', {
              transforms: [
                {
                  transform: 'react-transform-hmr',
                  // If you use React Native, pass 'react-native' instead:
                  imports: ['react'],
                  // This is important for Webpack HMR:
                  locals: ['module'],
                },
              ],
            }],
            ['transform-object-assign'],
          ],
        },
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpg|gif|png)$/,
        loader: 'url-loader',
      },
      {
        // Match woff2 in addition to patterns like .woff?v=1.1.1.
        test: /\.(woff|eot|ttf)?$/,
        loader: 'url',
        options: {
          limit: 50000,
          // mimetype: 'application/font-woff',
          // name: './fonts/[hash].[ext]',
        },
      },
      {
        test: /\.svg$/,
        loader: 'file',
      },
    ],
  },
};
