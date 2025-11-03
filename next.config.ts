import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	// Enable React strict mode for better error detection in production
	reactStrictMode: true,
	
	// Enable standalone output for Docker/optimized deployment
	output: 'standalone',
	
	// Enable SWC minification for better performance
	swcMinify: true,
	
	// Compress responses
	compress: true,
	
	// Environment variables
	env: {
		NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
		NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
	},
	
	// Configure images for external domains
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/dfcerueaq/**', // Specific to your Cloudinary account
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
		// Optimize images
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	
	// Security headers
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
				],
			},
		];
	},
	
	// Redirects for better UX
	async redirects() {
		return [
			{
				source: '/admin',
				destination: '/admin/dashboard',
				permanent: true,
			},
		];
	},
};

export default nextConfig;
