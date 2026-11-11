import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { env } from './env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
    // Off in every environment. With push on, dev rewrites the schema straight
    // from the config while production only changes through migrations, and
    // the two drift apart: a forgotten migration goes unnoticed locally and
    // breaks the deploy. Every schema change is `pnpm payload migrate:create`
    // then `pnpm payload migrate`, locally exactly as on the server.
    push: false,
  }),
  email: nodemailerAdapter({
    defaultFromAddress: env.EMAIL_FROM_ADDRESS,
    defaultFromName: env.EMAIL_FROM_NAME,
    // Checking the connection at boot only logs on failure, and during the
    // Docker build there's no SMTP server to reach.
    skipVerify: env.skipValidation,
    transportOptions: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      // 465 is implicit TLS; 587 and Mailpit's 1025 upgrade with STARTTLS or not at all.
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    },
  }),
  // Nothing uses GraphQL; REST and the Local API cover the admin and the
  // frontend. Turning it back on also needs the two routes under
  // app/(payload)/api/graphql* restored from create-payload-app.
  graphQL: {
    disable: true,
  },
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: { es, en },
  },
  sharp,
  plugins: [],
})
