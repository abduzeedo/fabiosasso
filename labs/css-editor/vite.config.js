import { defineConfig } from "vite";

export default defineConfig(() => {
  const isGh = process.env.GITHUB_PAGES === "true";
  const repo = process.env.REPO_NAME;
  return {
    base: isGh && repo ? `/${repo}/` : "/",
  };
});
