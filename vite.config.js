import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Qualquer requisição que o frontend faça para um caminho que comece com /game...
      "/game": {
        // ...será redirecionada para o seu servidor Laravel.
        // Verifique se a porta do seu Laravel é realmente 8000 (padrão do 'php artisan serve')
        target: "http://localhost:8000",

        // Esta linha é importante para o redirecionamento funcionar corretamente.
        changeOrigin: true,
      },
    },
  },
});
