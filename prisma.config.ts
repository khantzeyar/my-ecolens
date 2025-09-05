import 'dotenv/config';
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',

  seed: {
    run: 'ts-node --esm prisma/seed.ts',
  } as any,
});
