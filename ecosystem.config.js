module.exports = {
  apps: [
    {
      name: "web",
      cwd: "./apps/web",
      script: "pnpm",
      args: "start",
      env: { NODE_ENV: "production" },
      max_memory_restart: "600M",
    },
    {
      name: "worker",
      cwd: "./apps/worker",
      script: "dist/index.js",
      env: { NODE_ENV: "production" },
      // On restart the worker waits for in-flight checks to finish. The
      // slowest check is 3 attempts at a 10s timeout plus 3s of retry delay,
      // so PM2 must not force-kill it sooner than that.
      kill_timeout: 40000,
      max_memory_restart: "300M",
    },
  ],
};
