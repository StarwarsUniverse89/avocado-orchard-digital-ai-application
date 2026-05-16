import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  transpilePackages: ["cesium", "resium"],

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      })
    );

    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/cesium/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    });

    return config;
  },
};

export default nextConfig;
