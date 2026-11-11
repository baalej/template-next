// Server-side environment, read and checked in one place. Import `env` instead
// of reading `process.env` directly, so a missing variable fails at startup with
// a message naming it rather than as a confusing error deep inside Payload.
//
// `NEXT_PUBLIC_*` variables are not here on purpose: Next inlines them into the
// client bundle at build time, which only works with a literal
// `process.env.NEXT_PUBLIC_X` at the point of use.

// The Docker build evaluates the Payload config with no real secrets and no
// database (see the Dockerfile). It sets this flag so the checks below don't
// fail the build; nothing that runs with it set may rely on these values.
const skipValidation = process.env.SKIP_ENV_VALIDATION === '1'

const isProduction = process.env.NODE_ENV === 'production'

const missing: string[] = []

function required(name: string): string {
  const value = process.env[name]
  if (value) return value
  if (!skipValidation) missing.push(name)
  return ''
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback
}

export const env = {
  skipValidation,

  DATABASE_URL: required('DATABASE_URL'),
  PAYLOAD_SECRET: required('PAYLOAD_SECRET'),

  // Email goes over SMTP in every environment, so dev exercises the same code
  // path as production. Locally it defaults to the Mailpit container from
  // docker-compose.yml, which catches every message (UI on MAILPIT_UI_PORT).
  // In production there's no sensible default: an unset host must fail loudly,
  // or password resets would silently go nowhere.
  SMTP_HOST: isProduction ? required('SMTP_HOST') : optional('SMTP_HOST', 'localhost'),
  SMTP_PORT: Number(
    optional('SMTP_PORT', isProduction ? '587' : optional('MAILPIT_SMTP_PORT', '1025')),
  ),
  SMTP_USER: optional('SMTP_USER', ''),
  SMTP_PASS: optional('SMTP_PASS', ''),
  EMAIL_FROM_ADDRESS: isProduction
    ? required('EMAIL_FROM_ADDRESS')
    : optional('EMAIL_FROM_ADDRESS', 'dev@localhost'),
  EMAIL_FROM_NAME: optional('EMAIL_FROM_NAME', 'Website'),

  // Where Media stores uploaded files, relative to the working directory
  // (/app in the container, where the `media` volume is mounted). Tests point
  // it elsewhere so they never write into the dev uploads.
  MEDIA_DIR: optional('MEDIA_DIR', 'media'),
}

if (missing.length > 0) {
  throw new Error(
    `Missing environment variables: ${missing.join(', ')}. ` +
      'Locally they belong in .env; in production see .env.example.',
  )
}
