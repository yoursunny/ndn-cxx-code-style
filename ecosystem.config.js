module.exports = {
  apps: [
    {
      name: "ndn-cxx-code-style",
      script: "./process.cli.js",
      env: {
        NODE_ENV: "production",
      },
      autorestart: false,
      watch: false,
      cron_restart: "3-59/15 * * * *",
    },
  ],
};

