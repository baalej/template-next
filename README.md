# template-next

Plantilla para proyectos Next.js + Payload 3 + Postgres, desplegados en un
VPS con Docker Compose y Caddy.

## Cómo se monta esta plantilla

Estos ficheros se añaden sobre un proyecto generado por Payload:

```bash
pnpm dlx create-payload-app@latest template-next -t blank --db postgres --use-pnpm
cd template-next
rm -rf .git
```

Luego copia encima: `Dockerfile`, `.dockerignore`, `docker-compose.yml`,
`docker-compose.prod.yml`, `Caddyfile`, `.env.example` y este README.

Dos ajustes obligatorios:

1. **`next.config.ts`** debe tener `output: 'standalone'`. Sin eso el
   Dockerfile falla, porque copia `.next/standalone` que no existiría.
2. **Sustituye `PROJECT_NAME`** en ambos ficheros compose. El script
   `new-next` lo hace automáticamente.

## Desarrollo

La app corre **nativa** con `pnpm dev`; solo Postgres va en contenedor. El
HMR es mucho más rápido así, y en producción corre el build, no el dev
server, así que no se pierde paridad real.

```bash
colima start
docker compose up -d
pnpm dev
```

Al terminar:

```bash
docker compose down     # -v para borrar también los datos
colima stop
```

## Migraciones

Payload con Postgres usa migraciones. En desarrollo:

```bash
pnpm payload migrate:create nombre-del-cambio
pnpm payload migrate
```

Commitea siempre `src/migrations/`. En producción las aplica el servicio
`migrate`, que corre antes de que arranque la app.

## Despliegue en el VPS

Primera vez:

```bash
git clone <repo> && cd <repo>
cp .env.example .env      # rellenar con los valores de producción
docker compose -f docker-compose.prod.yml up -d --build
```

El servicio `migrate` corre solo, y `payload` espera a que termine con
éxito antes de arrancar.

Actualizaciones:

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Antes del primer despliegue

El registro A del dominio (y el de `www`, si existe) debe resolver ya al
servidor. Caddy responde el reto ACME por el puerto 80; si el DNS no
apunta todavía, la emisión del certificado falla.

## Decisiones que conviene no deshacer

**`name:` fijado en los compose.** Sin él, los nombres de volumen dependen
del directorio: clonar en una carpeta con otro nombre crea volúmenes
vacíos y parece pérdida de datos.

**`NEXT_PUBLIC_SERVER_URL` como `ARG` de build.** Next lo inlinea en el
build, no lo lee en runtime. Pasarlo solo por `environment:` lo deja
indefinido en todo lo prerenderizado.

**La etapa `migrator` hereda de `builder`.** El CLI de Payload necesita
las fuentes TypeScript y el `node_modules` completo, que no existen en el
output standalone.

**Nada debe conectar a la base de datos durante el build.** Una página con
`generateStaticParams` se prerenderiza en el contenedor de build; si al
renderizarla consulta Payload, el build muere con ECONNREFUSED.

**Postgres sin `ports:` en producción.** Solo accesible por la red interna
de Compose.

**`caddy_data` es un volumen a conservar.** Guarda los certificados y la
clave de cuenta ACME. Perderlo fuerza reemisión, y Let's Encrypt limita a
cinco certificados duplicados por semana.

## Mantener esta plantilla

Los proyectos creados **no** heredan cambios de aquí. Etiqueta con semver
cada versión que quieras que hereden los proyectos nuevos:

```bash
git tag v1.1.0 && git push --tags
```
