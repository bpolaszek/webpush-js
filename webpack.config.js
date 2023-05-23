module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "./bundle.js",
  },
  devtool: "source-map",
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: ["./webpush-sw.js"],
      },
    ],
  },
};
