const path = require("path");

const baseConfig = (mode) => {
  return {
    mode,
    devtool: "source-map",
    output: {
      //Replaced when expanding
    },
    devServer: {
      client: {
        overlay: true,
        logging: "log",
        progress: true,
      },
      static: {
        directory: path.join(__dirname),
      },
    },
    plugins: [],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: [/node_modules/],
          loader: "ts-loader",
          options: {
            experimentalWatchApi: true,
            compilerOptions: {
              target: "es2017",
            },
          },
        },
      ],
    },
    externals: {
      "monaco-editor": "monaco",
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
  };
};

function getConfigs(mode) {
  const ext = mode === "production" ? "min.js" : "js";

  output = {
    path: path.join(__dirname, "dist"),
    publicPath: "/dist",
  };

  const common_es2017 = {
    ...baseConfig(mode),
    output: {
      filename: "[name]-commonjs-es2017." + ext,
      ...output,
    },
    entry: {
      docs: "./src/example.tsx",
    },
  };
  return common_es2017;
}

module.exports = (env, argv) => {
  return getConfigs("development");
};
