import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [tailwindcss(), react(), basicSsl()],
  server: {
    host: true,
    port: 5173,
    https: {},
    proxy: {
      "/api": {
        target: "http://10.200.4.146:4000",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://10.200.4.146:4000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});