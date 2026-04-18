/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    serverExternalPackages: ["bcryptjs", "@prisma/client"],
};

export default nextConfig;
