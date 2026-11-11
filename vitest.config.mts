import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globalSetup: ['./tests/setup/globalSetup.ts'],
    setupFiles: ['./vitest.setup.ts'],
    projects: [
      {
        extends: true,
        test: {
          // Payload and database tests: plain Node, like the server they test.
          name: 'node',
          environment: 'node',
          // These share one test database, so files run one at a time.
          fileParallelism: false,
          include: ['tests/int/**/*.int.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          // Component tests need a DOM.
          name: 'dom',
          environment: 'jsdom',
          include: ['tests/int/**/*.int.spec.tsx'],
        },
      },
    ],
  },
})
