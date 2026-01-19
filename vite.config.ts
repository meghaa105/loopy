import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    let base = env.BASE || env.VITE_BASE || env.PUBLIC_URL || '/';

    // If no explicit base, try to infer from package.json 'homepage' (useful for GH Pages)
    if ((base === '/' || !base) && fs.existsSync(path.resolve(__dirname, 'package.json'))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
        if (pkg && pkg.homepage) {
          try {
            const url = new URL(pkg.homepage);
            base = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
          } catch {
            base = pkg.homepage.endsWith('/') ? pkg.homepage : `${pkg.homepage}/`;
          }
        }
      } catch (e) {
        // ignore and keep default '/'
      }
    }

    return {
      base,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
