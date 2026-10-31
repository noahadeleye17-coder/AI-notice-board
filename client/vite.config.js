import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The server only allows requests from port 5173, so keep this port fixed.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
