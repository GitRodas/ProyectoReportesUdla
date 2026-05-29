# UDLA Incidentes — Sistema de reporte

Aplicación web para reportar incidentes en el campus de la **Universidad de la Amazonia** (Next.js + **Supabase**).

## Stack

- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **Backend:** Supabase Auth, PostgreSQL, Storage (plan gratis)

## 1. Crear proyecto Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un proyecto (plan **Free**).
2. **SQL Editor** → pega y ejecuta todo el archivo `supabase/schema.sql`.
3. **Authentication** → Providers → activa **Email**.
4. Para pruebas rápidas: desactiva **Confirm email** en Authentication → Settings.
5. **Storage** → verifica que exista el bucket `incident-photos` (público).
6. **Project Settings → API** → copia `URL` y `anon public` key.

## 2. Variables de entorno

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_ADMIN_EMAILS=tu-correo@udla.edu.co
```

Reinicia el servidor después de guardar.

## 3. Ejecutar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 4. Rol administrador

Los correos en `NEXT_PUBLIC_ADMIN_EMAILS` reciben rol `administrador` al **registrarse**.

Si el usuario ya existe, en **Table Editor → profiles** cambia `role` a `administrador`.

## 5. Despliegue (Vercel)

1. Sube el código a GitHub.
2. Importa en [Vercel](https://vercel.com).
3. Agrega las mismas variables `NEXT_PUBLIC_*` en Environment Variables.
4. Despliega.

## Tablas

### `profiles`

| Campo | Descripción |
|-------|-------------|
| id | UUID (igual que auth.users) |
| email | Correo |
| nombre | Nombre completo |
| role | `usuario` \| `administrador` |

### `incidents`

| Campo | Descripción |
|-------|-------------|
| usuario_id, usuario_nombre | Quién reportó |
| tipo, descripcion | Detalle del incidente |
| imagen_url | URL en Storage |
| ubicacion_texto, latitud, longitud | Ubicación |
| estado | `reportado` \| `en_proceso` \| `resuelto` |
| grupo_id | Agrupación de reportes duplicados |

## Entrega académica

- Repositorio en GitHub.
- App desplegada (Vercel + Supabase).
- Envío al docente antes del **2 de junio de 2026, 12:00 m.**
