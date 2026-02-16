# Sistema de Gestión de Préstamos y Nómina

Aplicación web profesional construida con **Next.js + Tailwind** para cargar Excel, visualizar registros financieros, generar estados de cuenta en PDF agrupados por colaborador y enviar correos masivos.

## 1) Estructura de archivos del proyecto

```txt
.
├── app
│   ├── (auth)
│   │   └── login/page.tsx
│   ├── (dashboard)
│   │   └── dashboard/page.tsx
│   ├── api
│   │   ├── generate-pdf/route.ts
│   │   └── send-payroll-emails/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   └── dashboard-client.tsx
├── lib
│   ├── constants.ts
│   ├── email.ts
│   ├── excel.ts
│   ├── format.ts
│   ├── grouping.ts
│   ├── pdf.ts
│   └── types.ts
├── public
├── sql
│   └── supabase_schema.sql
├── package.json
└── tailwind.config.ts
```

## 2) Script SQL para Supabase

El script completo está en: `sql/supabase_schema.sql`.

Incluye:
- Tabla `estado_nomina_prestamos` con las 14 columnas del Excel.
- `id` autoincremental.
- `created_at`.
- Índices por nombre, seudónimo y correo.

## 3) Frontend para carga de Excel y previsualización

### Dependencia
```bash
npm install xlsx
```

### Flujo implementado
1. Usuario inicia sesión con credenciales fijas.
2. En dashboard, sube archivo Excel en **Upload Zone - Excel**.
3. Se parsea con `xlsx` desde `lib/excel.ts`.
4. Se normalizan encabezados (incluyendo `Intereses 10%`, `Le queda por pagar`, etc.).
5. Se renderiza tabla principal con:
   - Búsqueda por nombre o seudónimo.
   - Badge visual para `SALDO_PENDIENTE` (alerta si > 0).
   - Botón individual para generar PDF por empleado.

## 4) Lógica de PDF + envío de correos

### Generación de PDF
- Endpoint: `POST /api/generate-pdf`.
- Agrupación por empleado: `lib/grouping.ts`.
- Motor de PDF: `pdfkit` (`lib/pdf.ts`).
- Diseño incluye:
  - Logo dinámico (base64).
  - "Para: [NOMBRE]".
  - Fecha de emisión.
  - Etiqueta: `Nómina a descontar: [MES]`.
  - Tabla amortización:
    - Descripcion
    - Prestamo
    - Interes Cuota
    - Abono Capital
    - Cuota
    - Diferencia de sueldo abono
    - Total
  - Fila final de totales resaltada en amarillo `#FFFF00`.

### Envío masivo de correos
- Endpoint: `POST /api/send-payroll-emails`.
- Cliente SMTP: `nodemailer` con Gmail.
- Plantilla profesional en `lib/email.ts` con nombre del colaborador y mes.
- Cada correo incluye PDF individual adjunto.

### Variables de entorno necesarias
Crear `.env.local`:
```env
GMAIL_USER=tu_correo@gmail.com
GMAIL_APP_PASSWORD=tu_app_password_gmail
```

## Credenciales de acceso fijas
- Usuario: `brandonsantiesteban256@gmail.com`
- Contraseña: `Karen.0722`
