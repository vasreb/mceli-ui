import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
  plugins: [pluginReact(), pluginSass()],
  server: {
    port: 8000,
  },
  dev: {
    hmr: true,
  },
  html: {
    template: './index.html',
  },
  source: {
    entry: {
      index: './src/index.tsx',
    },
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000'),
    },
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
});

