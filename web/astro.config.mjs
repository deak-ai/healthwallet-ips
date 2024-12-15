import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";

export default defineConfig({
  integrations: [
    react(),
    // sentry(),
    // spotlightjs()
  ],
  output: 'static',
  server: { port: 7107 },
  devToolbar: { enabled: false }
});
