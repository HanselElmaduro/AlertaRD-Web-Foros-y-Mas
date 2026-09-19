# Alerta RD — Foro Ciudadano

Plataforma de información, participación ciudadana e investigación sobre una propuesta tecnológica dominicana para simplificar la solicitud de ayuda en emergencias. Incluye portada con las imágenes del creador, foro moderado, encuesta, votos, propuestas, resultados, simuladores, cuentas y administración.

**Estado honesto de la entrega:** la edición publicada usa una base de datos persistente Cloudflare D1. Supabase está preparado mediante un adaptador HTTP de servidor, scripts PostgreSQL y políticas RLS, pero no está conectado a un proyecto remoto porque no se proporcionaron credenciales. No se afirma una integración activa con 9-1-1 ni otras instituciones. Los simuladores nunca realizan llamadas, SMS, geolocalización, grabación o notificaciones reales.

## Tecnologías

- React 19, TypeScript y rutas App Router compatibles con Next.js.
- Vinext / Vite para la edición alojada en Sites, con Worker ESM.
- Tailwind CSS 4, estilos de marca y componentes shadcn/ui / Radix.
- Lucide, Recharts, React Hook Form y Zod.
- D1 / SQLite con Drizzle para la edición publicada.
- Adaptador alternativo Supabase / PostgreSQL por HTTP para Next.js/Vercel.
- Autenticación propia con correo, contraseña derivada con PBKDF2 y sesiones de servidor. **No se usa Supabase Auth.**

## Qué funciona

- Invitados y cuentas con correo, contraseña y alias; conversión de la sesión de invitado al registrarse.
- Foro con ocho categorías, búsqueda, filtros, orden, hilos y debates oficiales.
- Comentarios, respuestas, likes, reportes y moderación previa.
- Votos por función y por debate, con unicidad por participante y posibilidad de cambiar el voto.
- Configuración ideal con nueve funciones.
- Encuesta inicial de 13 preguntas y encuestas adicionales administrables, consentimiento registrado y protección de duplicados.
- Propuestas privadas con clasificación y seguimiento de estado.
- Perfil, historial, debates guardados y edición/eliminación de contenido propio.
- Resultados reales, gráficos, opiniones aprobadas y mapa **esquemático** de provincias. No incluye coordenadas personales ni límites cartográficos oficiales.
- Seguimiento público de decisiones del proyecto.
- Simulador SOS de 10 segundos y escenario de accidente de 15 segundos con cancelación.
- Panel `/admin`: métricas, moderación, debates, encuestas, propuestas, decisiones, equipo, biografía y exportación CSV.
- Estados vacíos, errores, carga, feedback, controles accesibles, 404, privacidad, términos y metadatos.

Los resultados se actualizan después de cada acción y mediante consulta cada 15 segundos; no se utiliza una conexión WebSocket. No se incluyen testimonios ni cifras de participación ficticios.

## Instalación

Requiere Node.js 22.13 o posterior y la versión de pnpm indicada en `package.json`.

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
```

Configura las variables. No subas `.env`, sesiones, bases locales ni claves al repositorio.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| DATABASE_PROVIDER | `d1` en Sites; `supabase` en Next.js/Vercel |
| DEMO_MODE | `true`. Los simuladores permanecen ficticios incluso si se cambia |
| NEXT_PUBLIC_SITE_URL | Origen HTTPS publicado o el origen local exacto |
| NEXT_PUBLIC_SUPABASE_URL | URL del proyecto Supabase, solo si se utiliza |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Reservada para compatibilidad; el navegador no consulta tablas directamente |
| SUPABASE_SERVICE_ROLE_KEY | Clave exclusiva del servidor para el adaptador Supabase |
| ADMIN_SETUP_TOKEN | Clave aleatoria privada para reclamar el primer administrador |
| RATE_LIMIT_SALT | Secreto aleatorio para las huellas temporales de limitación |

Genera los secretos con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Nunca uses las claves de las pruebas en producción.

## Desarrollo local con D1

La identidad del Site y la declaración lógica `DB` están en `.openai/hosting.json`. La estructura se define en `db/schema.ts` y las migraciones versionadas en `drizzle/`.

```bash
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_tan_ultimates.sql
pnpm dev
```

Aplica la migración solo una vez a cada base vacía. Para nuevas modificaciones usa `pnpm db:generate`, inspecciona el SQL y aplica únicamente las migraciones pendientes. No cambies una migración ya aplicada en producción.

El catálogo inicial se inserta de forma idempotente al primer acceso a la API; `seed.sql` explica este flujo. `schema.sql` es una copia de referencia del esquema SQLite, no debe ejecutarse además de las migraciones en la misma base.

En el entorno gestionado de Sites la vista de desarrollo se inicia con el supervisor de la plataforma. Fuera de ese entorno, `pnpm dev` ejecuta el flujo normal del proyecto.

## Supabase

En un **proyecto dedicado y vacío** ejecuta en orden:

1. `sql/supabase/schema.sql`
2. `sql/supabase/policies.sql`
3. `sql/supabase/rpc.sql`

Configura `DATABASE_PROVIDER=supabase`, la URL y `SUPABASE_SERVICE_ROLE_KEY` en el servidor. Nunca expongas la service role al navegador.

El adaptador usa una función transaccional `alerta_batch`. Se revoca su ejecución a `PUBLIC`, `anon` y `authenticated`, y se concede exclusivamente a `service_role`. Los parámetros se convierten a literales SQL con `quote_nullable`. No se aceptan consultas del usuario: las sentencias proceden exclusivamente del código del servidor. La API valida sesión, rol, propiedad y campos antes de ejecutarlas.

Todas las tablas tienen RLS activa y ningún acceso directo para los roles del navegador. Este diseño usa autenticación propia; no mezcla los identificadores de la aplicación con `auth.users`. Para usar Supabase Auth en el futuro se requiere una migración de identidad.

**Verificación pendiente:** ejecutar estas migraciones y el conjunto de pruebas contra un proyecto Supabase real. El hecho de incluir SQL y el adaptador no constituye una conexión remota verificada.

## Next.js y deployment en Vercel

Hazlo en una **copia independiente** del código descargado, para conservar la edición de Sites:

```bash
node scripts/prepare-vercel.mjs
pnpm install --frozen-lockfile
pnpm build
```

El script cambia los comandos a Next.js, selecciona el proveedor de entorno Node y crea `vercel.json`. Configura las variables en Vercel, con `DATABASE_PROVIDER=supabase`. Ejecuta primero los SQL de Supabase y verifica el flujo registro → encuesta → moderación → resultados antes de abrir la convocatoria. Cambiar de D1 a Supabase no mueve automáticamente los datos existentes.

## Publicación en Sites

La edición principal compila con `pnpm build` y emite el Worker en `dist/server/index.js`, los recursos en `dist/client` y los archivos de migración para el despliegue. La plataforma aplica las migraciones al publicar y proporciona el enlace y los controles de acceso. La primera entrega se mantiene privada para el creador.

Configura las variables secretas en el alojamiento, no en el manifiesto. La apertura al público se administra en los controles del Site. Si se publica en otro alojamiento, revisa el origen permitido y las cabeceras del proxy de confianza.

## Primer administrador

1. Abre `/cuenta` y crea tu cuenta con correo, alias y contraseña propia.
2. Abre `/admin` e introduce la clave privada de configuración inicial entregada por separado.
3. La primera reclamación válida registra de forma atómica la cuenta administradora; otros usuarios no pueden volver a reclamarla.
4. Una vez configurado, elimina `ADMIN_SETUP_TOKEN` de las variables del alojamiento y vuelve a desplegar.
5. Desde Configuración puedes conceder permisos a cuentas existentes. Un moderador no puede administrar roles ni crear encuestas o decisiones.

No existe usuario administrador con contraseña predeterminada. La clave privada de la entrega **no está en este ZIP**.

## Moderación e investigación

Los hilos y comentarios de participantes comienzan pendientes. Solo los aprobados son públicos. Un reporte no elimina automáticamente el contenido. Las respuestas de administradores y moderadores se identifican como oficiales. Destaca opiniones solo cuando sean reales y apropiadas para mostrar.

Las propuestas son privadas. Para documentar su influencia, registra una decisión con preocupación, sugerencia, respuesta, cambio y estado. Las preguntas de una encuesta que ya tiene respuestas no se pueden cambiar: crea una encuesta nueva.

El CSV contiene resultados agregados y es compatible con Excel. No incluye contraseñas, emails ni identificadores privados. No hay exportación nativa XLSX. Revisa las celdas abiertas de encuestas personalizadas antes de distribuir exportaciones.

La consulta es abierta y no probabilística. La protección de duplicados por cookie/cuenta es básica, no verifica personas únicas. No generalices los porcentajes a toda la sociedad dominicana.

## Seguridad y límites operativos

- Sesiones aleatorias de 256 bits, almacenadas mediante SHA-256; cookie HttpOnly, SameSite=Lax y Secure en HTTPS; vencimiento de 30 días.
- Contraseñas PBKDF2-SHA256 con sal individual, 100.000 iteraciones y comparación de longitud constante; límite compatible con Web Crypto del Worker. Reevalúa el coste/algoritmo según el proveedor antes de escalar.
- Restricción de origen, validación Zod en servidor, consultas parametrizadas y autorización por rol/propiedad.
- React representa los aportes como texto, sin `dangerouslySetInnerHTML`.
- Rate limiting persistente, honeypots, límites de longitud y consentimiento obligatorio de encuesta.
- APIs privadas sin caché y claves solo en servidor. CSV protege prefijos de fórmulas.
- No se ha configurado correo transaccional: no hay verificación de email, recuperación de contraseña por correo, MFA ni captcha externo. Estos no se simulan con botones falsos.
- No hay auditoría de penetración, prueba de carga ni certificación WCAG formal. Se prueban los recorridos descritos en `docs/VALIDACION.md`.
- Los textos de privacidad describen el funcionamiento implementado; antes de una campaña pública, el responsable debe definir su política de conservación y revisar su adecuación al uso previsto.

## Datos demo y pruebas

`sql/demo.sql` es optativo y solo debe ejecutarse en una base separada. Todas las filas se identifican como DEMO y no se aplican en producción. `tests/api.spec.ts` crea y elimina datos ficticios en SQLite en memoria.

```bash
node tests/run.mjs
pnpm exec tsc --noEmit
pnpm build
```

Las pruebas de API utilizan los manejadores reales y sustituyen únicamente el controlador de la base de datos por SQLite aislado. Comprueban 27 recorridos de identidad, permisos, encuestas, moderación, exportación, privacidad, deduplicación y límites. No escriben en la base publicada.

## Estructura

- `app/`: rutas, layout, metadatos, errores y API.
- `components/layout/`: navegación y pie.
- `components/forum/`, `polls/`, `forms/`, `simulator/`, `charts/`, `admin/`: recorridos separados.
- `components/ui/`: primitivas reutilizables de shadcn.
- `lib/content.ts`: funciones, provincias, categorías, encuesta inicial y debates oficiales.
- `lib/server/`: autenticación, autorización, validación, persistencia, foro, resultados y administración.
- `db/`, `drizzle/`, `schema.sql`, `seed.sql`, `policies.sql`: estructura y migraciones.
- `sql/supabase/`: versión PostgreSQL y RLS.
- `public/images/`: imágenes WebP optimizadas. Consulta `docs/ASSETS.md`.
- `tests/`: pruebas aisladas, sin datos ni credenciales reales.

## Identidad

Creado para Gabriel Robles, fundador de Alerta RD. Las imágenes se utilizan como materiales conceptuales facilitados por el creador. La aplicación móvil se presenta como un proyecto aún no disponible, sin premios o respaldos institucionales afirmados.
