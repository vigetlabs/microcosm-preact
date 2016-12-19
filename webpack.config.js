var path = require('path')

module.exports = {
  entry: "./example/example.js",

  output: {
    filename : 'example.build.js'
  },

  module: {
    loaders: [{
      test: /\.jsx*/,
      loader: 'babel',
      exclude: [/node_modules/]
    }]
  },

  devServer: {
    port: 3000,
    contentBase: path.resolve(__dirname, 'example')
  }
}
