/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/admin/dashboard", destination: "/admin" },
      { source: "/admin/welcome", destination: "/welcome" },
      { source: "/admin/docs", destination: "/docs" },
      { source: "/admin/chat", destination: "/chat" },
      { source: "/admin/chat/:sessionId", destination: "/chat/:sessionId" },
      { source: "/admin/datasets", destination: "/datasets" },
      { source: "/admin/datasets/:datasetId", destination: "/datasets/:datasetId" },
      { source: "/admin/tools", destination: "/tools" },
      { source: "/admin/tools/:toolId", destination: "/tools/:toolId" },
      { source: "/admin/models", destination: "/models" },
      { source: "/admin/tags", destination: "/tags" },
      { source: "/admin/prompts", destination: "/prompts" },
      { source: "/admin/settings", destination: "/settings" },

      { source: "/:userId/dashboard", destination: "/dashboard" },
      { source: "/:userId/welcome", destination: "/welcome" },
      { source: "/:userId/docs", destination: "/docs" },
      { source: "/:userId/chat", destination: "/chat" },
      { source: "/:userId/chat/:sessionId", destination: "/chat/:sessionId" },
      { source: "/:userId/datasets", destination: "/datasets" },
      { source: "/:userId/datasets/:datasetId", destination: "/datasets/:datasetId" },
      { source: "/:userId/tools", destination: "/tools" },
      { source: "/:userId/tools/:toolId", destination: "/tools/:toolId" },
      { source: "/:userId/models", destination: "/models" },
      { source: "/:userId/tags", destination: "/tags" },
      { source: "/:userId/prompts", destination: "/prompts" },
      { source: "/:userId/settings", destination: "/settings" },
    ];
  },
};

export default nextConfig;
