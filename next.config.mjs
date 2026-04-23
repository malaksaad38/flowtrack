/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    serverExternalPackages: ["bcryptjs", "@prisma/client", "better-auth"],
    headers: async () => [
        {
            // Allow service worker to control the entire scope
            source: "/sw.js",
            headers: [
                {
                    key: "Cache-Control",
                    value: "no-cache, no-store, must-revalidate",
                },
                {
                    key: "Service-Worker-Allowed",
                    value: "/",
                },
            ],
        },
    ],
};

export default nextConfig;
