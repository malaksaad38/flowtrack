/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    serverExternalPackages: ["bcryptjs", "@prisma/client", "better-auth"],
};

export default nextConfig;
