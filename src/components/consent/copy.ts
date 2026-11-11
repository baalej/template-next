import { site } from '@/lib/site'

// Banner copy per language. Add a language here when a site needs one.
const copy = {
  en: {
    region: 'Cookie consent',
    message:
      "We use analytics cookies to understand how this site is used. They're only set if you accept.",
    reject: 'Reject',
    accept: 'Accept',
    settings: 'Cookie settings',
    policy: 'Privacy policy',
  },
  es: {
    region: 'Consentimiento de cookies',
    message:
      'Usamos cookies analíticas para entender cómo se usa este sitio. Solo se instalan si las aceptas.',
    reject: 'Rechazar',
    accept: 'Aceptar',
    settings: 'Configurar cookies',
    policy: 'Política de privacidad',
  },
} as const

export type ConsentCopy = (typeof copy)[keyof typeof copy]

export const consentCopy: ConsentCopy = copy[site.lang as keyof typeof copy] ?? copy.en
