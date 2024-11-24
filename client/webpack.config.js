const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/js/index.js",
  plugins: [
    new HtmlWebpackPlugin({
      // hash: true,
      title: "caca.gg",
      metaDesc: "caca.gg",
      template: "./src/html/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new MiniCssExtractPlugin(),
    new ESLintPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/assets/favicon.ico", to: "favicon.ico" },
        { from: "src/assets/apple-touch-icon.png", to: "apple-touch-icon.png" },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        exclude: /node_modules/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js"],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "../server/dist"),
    clean: true,
  },
};
