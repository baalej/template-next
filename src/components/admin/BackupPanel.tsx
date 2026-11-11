import { Button } from '@payloadcms/ui'
import type { ServerProps } from 'payload'

import { isAdminUser } from '@/access'

const copy = {
  en: {
    title: 'Backup',
    body: 'Download the whole site: database and uploaded files, in a single .tar file. Large sites can take a few minutes.',
    restore: 'To restore a backup, contact whoever maintains the site.',
    button: 'Download backup',
  },
  es: {
    title: 'Copia de seguridad',
    body: 'Descarga el sitio completo: base de datos y archivos subidos, en un único archivo .tar. En sitios grandes puede tardar unos minutos.',
    restore: 'Para restaurar una copia, contacta con quien mantiene el sitio.',
    button: 'Descargar copia',
  },
}

// Rendered under the dashboard (admin.components.afterDashboard), for admins only.
export default function BackupPanel(props: ServerProps) {
  const { i18n, payload, user } = props
  if (!isAdminUser(user)) return null

  const text = copy[i18n.language as keyof typeof copy] ?? copy.en
  const href = `${payload.config.serverURL}${payload.config.routes.api}/backup`

  return (
    <section style={{ marginTop: 'calc(var(--base) * 2)' }}>
      <h2>{text.title}</h2>
      <p>{text.body}</p>
      {/* A plain link: the browser streams the download and shows its own
          progress, and the admin's session cookie authenticates it. */}
      <Button buttonStyle="primary" el="anchor" url={href}>
        {text.button}
      </Button>
      <p style={{ opacity: 0.7 }}>{text.restore}</p>
    </section>
  )
}
