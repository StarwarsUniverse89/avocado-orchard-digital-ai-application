import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  transpilePackages: ["cesium", "resium"],
  webpack: (config) => {
    // Define CESIUM_BASE_URL for static assets
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      })
    );

    // Cesium configuration
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/cesium/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    });

    return config;
  },
};

export default nextConfig;
