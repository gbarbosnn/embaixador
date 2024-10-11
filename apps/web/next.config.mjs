/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    remotePatterns:[{
      protocol:'https',
      hostname: 'vinhosjolimont.vteximg.com.br'
    }]
  }
};

export default nextConfig;
