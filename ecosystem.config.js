module.exports = {
  apps: [
    {
      name: "web",
      cwd: "./apps/web",
      script: "pnpm",
      args: "start",
    },
    {
      name: "worker",
      cwd: "./apps/worker",
      script: "dist/index.js",
    },
  ],
};
