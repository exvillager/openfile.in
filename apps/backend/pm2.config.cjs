module.exports = {
  apps: [
    {
      name: "server",
      script: "index.ts",
    },
    // {
    //   name:"clean-up-worker",
    //   script:'./src/utils/cleanupExpiredLinks.ts'
    // },
    // {
    //   name:"delete-file-worker",
    //   script:"./src/bullmq/workers/delete-files.worker.ts"
    // }
  ],
};
