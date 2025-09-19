import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Forestry 图片
      {
        protocol: "https",
        hostname: "forestry.gov.my",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.forestry.gov.my",
        port: "",
        pathname: "/**",
      },
      // OpenWeatherMap 图标
      {
        protocol: "https",
        hostname: "openweathermap.org",
        port: "",
        pathname: "/img/wn/**",
      },
    ],
  },
};

export default nextConfig;
