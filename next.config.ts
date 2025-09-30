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
		],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
