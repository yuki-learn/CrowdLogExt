const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, './src', 'content.ts'),

  output: {
    filename: 'content.js',
    path: path.join(__dirname, './dist')
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [

      // js, ts
      {
        test: /\.(js|ts)$/,
        exclude: /(node_modules|tests)/,

        use: [
          {
            loader: 'babel-loader',

            // Babel のオプション
            options: {
              presets: [
                ["@babel/preset-env", {
                  'useBuiltIns': 'usage',
                  'corejs': 3
                }
                ],
              ]
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          },
        ]
      }
    ]
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(__dirname, './tsconfig.json')
      }
    }),
  ],
};