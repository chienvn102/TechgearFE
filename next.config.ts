import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	// Disable React strict mode to reduce hydration warnings
	reactStrictMode: false,
	// Configure images for external domains
	images: {
		domains: [
			'res.cloudinary.com',  // Cloudinary domain for image hosting
			'localhost',            // Local development images
			'api-merchant.payos.vn', // PayOS QR code domain
			'img.vietqr.io',        // VietQR domain
		],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'api-merchant.payos.vn',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'img.vietqr.io',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
