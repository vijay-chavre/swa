'use strict'; // eslint-disable-line strict, lines-around-directive

const path = require('path');
const webpack = require('webpack');
const del = require('del'); // eslint-disable-line import/no-extraneous-dependencies
const CompressionPlugin = require('compression-webpack-plugin');

const env = new webpack.DefinePlugin({
  ENV: JSON.stringify(require(path.join(__dirname, './env/', process.env.NODE_ENV ? process.env.NODE_ENV : 'production'))),
  isViaAfrika: process.env.isViaAfrika || false,
});

class CleanPlugin {
  constructor(options) {
    this.options = options;
  }

  apply() {
    del.sync(this.options.files);
  }
}

module.exports = {
  entry: {
    app: './src/index',
    vendors: ['react', 'react-dom', 'moment', 'redux-form', 'axios', 'lodash', 'firebase', 'recharts'],
  },
  output: {
    path: path.resolve(__dirname, '..', 'dist', 'js'),
    filename: `app.min.${process.env.RELEASE}.js`,
  },
  devtool: 'source-map',
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new CleanPlugin({
      files: ['dist/*'],
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
        screw_ie8: true,
      },
      sourceMap: true,
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.CommonsChunkPlugin({ name: 'vendors', filename: 'vendors.bundle.v01.js' }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
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
