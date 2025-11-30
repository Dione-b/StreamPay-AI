import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasource: {
    provider: 'sqlite',
    url: 'file:./dev.db',
  },
});
