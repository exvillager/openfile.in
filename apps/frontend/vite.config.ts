import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// const backendUrl = process.env.VITE_PRODUCTION == 'true'
//   ? process.env.VITE_BACKEND_APP_URL
//   : "http://localhost:8000"

//   console.log(backendUrl)

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths({ ignoreConfigErrors: true })],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "EVAL" && warning.id?.includes("lottie-web")) return;
        warn(warning);
      },
    },
  },
});
