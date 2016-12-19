var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin")
var path = require('path')

module.exports = {
  entry: {
    "bundle": "./example/example.js",
    "vendor": ["microcosm", "preact"]
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'example')
  },

  module: {
    loaders: [{
      test: /\.jsx*/,
      loader: 'babel'
    }]
  },

  plugins: [
    new CommonsPlugin({
      name: "vendor"
    })
  ],

  devServer: {
    port: 3000,
    contentBase: path.resolve(__dirname, 'example')
  }
}
