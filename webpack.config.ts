import { resolve } from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  entry: {
    registry: './src/handlers/registry.ts',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'build'),
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  target: 'node',
  mode: 'production',
};

export default config;
