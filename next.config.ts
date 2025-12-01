import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 모드에서 Cross origin 요청 허용
  // 서버에서 직접 CORS 헤더를 설정하므로 여기서는 빈 배열로 설정
  allowedDevOrigins: [],
  reactStrictMode: false,
};

export default nextConfig;
