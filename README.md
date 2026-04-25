<h1 align="center">KeyGo — Plataforma de Gestión Inteligente de Llaves</h1>

<p align="center">
  <em>Sistema completo para depositar, gestionar y autorizar el acceso a llaves físicas a través de puntos aliados, usando códigos digitales y tecnología NFC.</em>
</p>

<br/>

## 🚀 Tecnologías Utilizadas

<img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white"> <img src="https://img.shields.io/badge/v11-111827?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/v5.7-1e3a5f?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"> <img src="https://img.shields.io/badge/BASE_DE_DATOS-1a2f6e?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white"> <img src="https://img.shields.io/badge/v6-0f172a?style=flat-square">

<img src="https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/v0.81-0c4a6e?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white"> <img src="https://img.shields.io/badge/v54-1f2937?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"> <img src="https://img.shields.io/badge/AUTENTICACIÓN-374151?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white"> <img src="https://img.shields.io/badge/BaaS-166534?style=flat-square">

<img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black"> <img src="https://img.shields.io/badge/API_DOCS-3d6e0f?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/Bcrypt-FF6B6B?style=flat-square"> <img src="https://img.shields.io/badge/SEGURIDAD-7f1d1d?style=flat-square">&nbsp;&nbsp;<img src="https://img.shields.io/badge/Expo_Router-000020?style=flat-square&logo=expo&logoColor=white"> <img src="https://img.shields.io/badge/NAVEGACIÓN_POR_ROL-1f2937?style=flat-square">

---

## 📋 Tabla de Contenidos

- [🎯 ¿Qué es KeyGo?](#-qué-es-keygo)
- [✅ Fase 1 — Entregable Completo](#-fase-1--entregable-completo)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [📁 Estructura de Carpetas](#-estructura-de-carpetas)
- [🗄️ Base de Datos — 12 Tablas](#️-base-de-datos--12-tablas)
- [🔒 Seguridad Implementada](#-seguridad-implementada)
- [📖 API y Documentación Swagger](#-api-y-documentación-swagger)
- [📱 App Móvil — Conexión con el Servidor](#-app-móvil--conexión-con-el-servidor)
- [🚀 Cómo Ejecutar el Proyecto](#-cómo-ejecutar-el-proyecto)
- [🔬 Guía de Pruebas para el Cliente](#-guía-de-pruebas-para-el-cliente)

---

## 🎯 ¿Qué es KeyGo?

KeyGo es una plataforma digital B2B2C que permite a los propietarios de llaves depositar y gestionar sus llaves físicas en **puntos aliados** (tiendas de barrio, ferreterías, droguerías). El sistema elimina la dependencia de copias físicas y garantiza trazabilidad completa mediante **códigos digitales únicos** y **llaveros NFC**.

### Los tres tipos de usuario del sistema

| Rol | ¿Quién es? | ¿Qué puede hacer? |
|---|---|---|
| **OWNER** | Propietario de la llave | Crear llaves, generar códigos de acceso, consultar historial de movimientos |
| **STORE** | Punto aliado (tienda) | Validar códigos, escanear llaveros NFC y registrar depósitos y recogidas |
| **ADMIN** | Equipo KeyGo | Control total del sistema, corrección de incidencias e intervención manual |

---

## ✅ Fase 1 — Entregable Completo

> **Compromiso pactado:** *"API documentada (Swagger) con endpoints de autenticación y App Móvil con pantallas de inicio de sesión conectadas al servidor."*

### Lo que se construyó en la Fase 1

| # | Compromiso | Implementación realizada | Estado |
|---|---|---|---|
| 1 | Configuración del servidor Backend | Servidor **NestJS v11** completamente modular, con CORS habilitado, validación global de datos y arranque listo para producción | ✅ |
| 2 | Diseño de base de datos PostgreSQL | **12 tablas reales** diseñadas y desplegadas en **Supabase** (PostgreSQL), cubriendo los 11 módulos funcionales del sistema completo | ✅ |
| 3 | Implementación de seguridad | Contraseñas protegidas con **Bcrypt**, sesiones con **JWT 24h**, control de roles, normalización de correos y protección contra registros duplicados en doble capa | ✅ |
| 4 | Configuración del entorno híbrido Mobile | App en **Expo + React Native** con **Expo Router** y rutas separadas por rol: `(owner)`, `(store)` y `(admin)` | ✅ |
| 5 | API documentada en Swagger | Interfaz interactiva disponible en `/api/docs` con descripciones, ejemplos de cuerpo y todos los códigos de respuesta HTTP documentados | ✅ |
| 6 | Endpoints de autenticación | `POST /auth/register` y `POST /auth/login` funcionales con manejo completo de errores (400, 401, 409) | ✅ |
| 7 | App Móvil conectada al servidor | Pantallas de Login y Registro en la App que consumen la API real; tras login exitoso, el sistema redirige automáticamente al panel correcto según el rol | ✅ |

---

## 🏗️ Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor desacoplada. La App Móvil y (en el futuro) el Panel Web se comunican con un único Backend a través de una API REST.

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                 │
│                                                                  │
│   ┌─────────────────────┐    ┌──────────────────────────────┐   │
│   │   App Móvil         │    │   Panel Admin Web            │   │
│   │   Expo / React Native│   │   (Fase 5 — Despliegue AWS)  │   │
│   │   iOS y Android     │    │                              │   │
│   └──────────┬──────────┘    └──────────────┬───────────────┘   │
└──────────────┼──────────────────────────────┼───────────────────┘
               │   HTTP / REST  (Axios)        │
               ▼                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND — NestJS v11                          │
│                                                                  │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐  │
│   │   Auth     │  │   Users    │  │   Prisma   │  │ Swagger │  │
│   │   Module   │  │   Module   │  │   Service  │  │/api/docs│  │
│   └────────────┘  └────────────┘  └─────┬──────┘  └─────────┘  │
└─────────────────────────────────────────┼────────────────────────┘
                                          │  ORM Prisma v6
                                          ▼
┌──────────────────────────────────────────────────────────────────┐
│             BASE DE DATOS — PostgreSQL en Supabase               │
│                                                                  │
│  users  ·  stores  ·  keys  ·  key_tags  ·  pickup_codes        │
│  deposit_codes  ·  key_movements  ·  payments                    │
│  payment_methods  ·  store_payouts  ·  key_history               │
│  admin_actions                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas

```
KeyGo/
│
├── 📁 keygo-backend/                      # Servidor NestJS — API REST
│   │
│   ├── 📁 src/
│   │   ├── 📁 auth/                       # Módulo de Autenticación (Fase 1)
│   │   │   ├── 📁 dto/
│   │   │   │   ├── register.dto.ts        # Esquema de validación del registro
│   │   │   │   └── login.dto.ts           # Esquema de validación del login
│   │   │   ├── auth.controller.ts         # Endpoints REST + decoradores Swagger
│   │   │   ├── auth.service.ts            # Lógica de negocio: Bcrypt, JWT, anti-duplicados
│   │   │   └── auth.module.ts             # Declara dependencias del módulo
│   │   │
│   │   ├── 📁 users/                      # Módulo de Usuarios
│   │   │   ├── users.service.ts           # Consultas a la BD: findByEmail, create
│   │   │   └── users.module.ts            # Declara dependencias del módulo
│   │   │
│   │   ├── 📁 prisma/                     # Conexión a la base de datos
│   │   │   ├── prisma.service.ts          # Cliente Prisma singleton
│   │   │   └── prisma.module.ts           # Módulo global exportable
│   │   │
│   │   ├── app.module.ts                  # Módulo raíz: importa Auth, Users, Prisma
│   │   └── main.ts                        # Arranque: CORS, Swagger, ValidationPipe
│   │
│   ├── 📁 prisma/
│   │   └── schema.prisma                  # Las 12 tablas, enums y relaciones
│   │
│   ├── .env                               # Variables de entorno (no subir a Git)
│   ├── .gitignore                         # Excluye node_modules, dist, .env
│   └── package.json                       # Dependencias del backend
│
└── 📁 keygo-app/                          # App Móvil — Expo / React Native
    │
    ├── 📁 app/                            # Rutas gestionadas automáticamente por Expo Router
    │   ├── _layout.tsx                    # Layout raíz: carga AuthProvider + guard de roles
    │   ├── index.tsx                      # Pantalla de Login (pública)
    │   ├── register.tsx                   # Pantalla de Registro (pública)
    │   │
    │   ├── 📁 (owner)/                   # Rutas exclusivas del Propietario
    │   │   ├── _layout.tsx               # Layout protegido para rol OWNER
    │   │   └── dashboard.tsx             # Panel principal del propietario
    │   │
    │   ├── 📁 (store)/                   # Rutas exclusivas del Punto Aliado
    │   │   ├── _layout.tsx               # Layout protegido para rol STORE
    │   │   └── dashboard.tsx             # Panel principal de la tienda
    │   │
    │   └── 📁 (admin)/                   # Rutas exclusivas del Administrador
    │       ├── _layout.tsx               # Layout protegido para rol ADMIN
    │       └── dashboard.tsx             # Panel principal de administración
    │
    ├── 📁 context/
    │   └── AuthContext.tsx               # Estado global: usuario, token, login, logout
    │
    ├── 📁 services/
    │   ├── api.ts                        # Cliente Axios configurado con la URL del servidor
    │   └── auth.service.ts              # Funciones: login(), register()
    │
    ├── 📁 assets/                        # Íconos y splash screen de la app
    ├── index.ts                          # Punto de entrada real → expo-router/entry
    ├── app.json                          # Nombre, versión y configuración de Expo
    └── package.json                      # Dependencias de la app
```

---

## 🗄️ Base de Datos — 12 Tablas

> Las 12 tablas fueron diseñadas desde la **Fase 1** para soportar el sistema completo, no solo la autenticación. Esto garantiza que las siguientes fases se construyan sobre una base sólida sin reestructurar la base de datos.

### 👥 Módulo 1 — Usuarios y Acceso

**Tabla `users`**
Contiene a todos los usuarios del sistema: propietarios, tiendas y administradores.

| Campo | Descripción |
|---|---|
| `id` | Identificador único del usuario |
| `full_name` | Nombre completo para reportes y notificaciones |
| `email` | Correo único y normalizado (minúsculas) — clave de acceso |
| `password_hash` | Contraseña encriptada con Bcrypt. Nunca se guarda en texto plano |
| `role` | Rol del usuario: `OWNER`, `STORE` o `ADMIN` |
| `status` | Activo o desactivado (permite bloquear sin eliminar) |
| `created_at` | Fecha y hora de registro |

**Tabla `payment_methods`**
Almacena la referencia segura al método de pago del cliente en Stripe.

| Campo | Descripción |
|---|---|
| `gateway_customer_id` | ID del cliente en Stripe |
| `gateway_payment_method_id` | Referencia del método de pago en Stripe |
| `brand` | Marca de la tarjeta (Visa, Mastercard, etc.) |
| `last4` | Últimos 4 dígitos visibles — nunca el número completo |
| `is_default` | Indica si es el método principal del cliente |

---

### 🗝️ Módulo 2 — Gestión de Llaves

**Tabla `keys`**
Entidad central del sistema. Cada fila representa una llave física registrada.

| Campo | Descripción |
|---|---|
| `key_name` | Nombre que el propietario le da a su llave (ej: "Casa Laureles") |
| `owner_user_id` | Usuario propietario de la llave |
| `store_id` | Punto aliado asignado donde se deposita |
| `key_photo_url` | Foto de la llave para identificarla en caso de incidencia |
| `plan_type` | Plan seleccionado: `monthly` (mensual) o `pay_per_use` (por uso) |
| `key_status` | Estado actual: `WAITING_DEPOSIT`, `DEPOSITED`, `IN_USE` o `DELETED` |
| `deleted_at` | Fecha de eliminación (borrado lógico — el historial se conserva) |

**Tabla `key_tags`**
Gestiona el llavero NFC físico único que se asocia a cada llave.

| Campo | Descripción |
|---|---|
| `tag_uid` | Identificador único del chip NFC (no se repite en el sistema) |
| `tag_type` | Tipo de identificador: `NFC` |
| `status` | Estado del llavero: `active`, `replaced` o `inactive` |
| `replaced_at` | Fecha en que fue reemplazado (histórico de cambios) |

---

### 🎫 Módulo 4 — Códigos de Acceso

**Tabla `deposit_codes`**
Código único para depositar la llave por primera vez en el punto aliado.

| Campo | Descripción |
|---|---|
| `code_value` | El código en sí (único en todo el sistema) |
| `status` | Estado: `active`, `used` |
| `used_at` | Momento exacto en que fue utilizado |

**Tabla `pickup_codes`**
Códigos que el propietario crea para que otras personas retiren la llave.

| Campo | Descripción |
|---|---|
| `code_value` | El código en sí (único en todo el sistema) |
| `code_mode` | Tipo: `SINGLE_USE` (se destruye al usarse) o `REUSABLE` (para personas frecuentes) |
| `label_name` | Nombre de la persona a quien se le comparte el código (opcional) |
| `active_from` | Hora a partir de la cual el código es válido (control de horario de check-in) |
| `status` | Estado: `active`, `used`, `cancelled`, `pending_schedule` |
| `used_at` | Fecha y hora exacta de uso |

---

### 🔄 Módulo 6/7 — Depósitos y Recogidas

**Tabla `key_movements`**
Registra cada depósito y cada recogida. Es la "caja negra" operativa del sistema.

| Campo | Descripción |
|---|---|
| `movement_type` | Tipo de acción: `deposit` o `pickup` |
| `movement_method` | Cómo se hizo: `deposit_code`, `pickup_code`, `NFC` o `admin_remote` |
| `store_id` | Punto aliado donde ocurrió el movimiento |
| `pickup_code_id` | Código de recogida utilizado (si aplica) |
| `deposit_code_id` | Código de depósito utilizado (si aplica) |
| `key_tag_id` | Llavero NFC utilizado (si aplica) |
| `movement_datetime` | Fecha y hora exacta del movimiento |
| `notes` | Observaciones adicionales |

---

### 💰 Módulo 3 — Pagos

**Tabla `payments`**
Guarda el resultado de cada cobro realizado al propietario.

| Campo | Descripción |
|---|---|
| `payment_type` | Tipo de cobro: `monthly_subscription` o `pay_per_use` |
| `amount` | Valor cobrado |
| `payment_status` | Estado: `pending`, `paid`, `failed`, `refunded` |
| `gateway_name` | Pasarela utilizada (Stripe) |
| `gateway_reference` | Referencia única de Stripe para el cobro |
| `paid_at` | Fecha y hora del pago exitoso |

---

### 🏬 Módulo 8 — Puntos Aliados

**Tabla `stores`**
Catálogo completo de los puntos aliados donde se depositan las llaves.

| Campo | Descripción |
|---|---|
| `store_name` | Nombre del establecimiento |
| `address` | Dirección física |
| `main_phone` | Teléfono principal |
| `whatsapp` | Número de WhatsApp para comunicaciones |
| `opening_hours` | Horario de atención |
| `google_maps_link` | Link directo para navegación |
| `instructions` | Instrucciones especiales para llegar o depositar |

**Tabla `store_payouts`**
Controla lo que se le debe pagar a cada tienda por los depósitos recibidos.

| Campo | Descripción |
|---|---|
| `amount` | Comisión a pagar (3.000 COP por depósito) |
| `payout_status` | Estado: `pending`, `approved`, `paid` |
| `period_month` | Mes al que corresponde el corte |

---

### 📊 Módulo 10/11 — Historial y Administración

**Tabla `key_history`**
Registra todos los eventos de la llave más allá de los movimientos operativos.

| Campo | Descripción |
|---|---|
| `event_type` | Tipo de evento: creación, cambio de estado, generación de código, eliminación, etc. |
| `old_value` | Valor anterior al cambio |
| `new_value` | Valor nuevo después del cambio |
| `notes` | Observaciones sobre el cambio |

**Tabla `admin_actions`**
Documenta cada intervención manual del equipo KeyGo para auditoría.

| Campo | Descripción |
|---|---|
| `admin_user_id` | Administrador que realizó la acción |
| `action_type` | Tipo de intervención (depósito remoto, recogida remota, cambio de estado) |
| `reason` | Motivo de la intervención |
| `notes` | Observaciones internas |

---

### Máquina de Estados de la Llave

Cada llave tiene **un único estado en todo momento**. Solo el sistema puede cambiarlo y solo cuando se cumplan todas las condiciones requeridas.

```
         ┌──────────────────────┐
         │   WAITING_DEPOSIT    │  ← Se crea la llave. Aún no está en tienda.
         └──────────┬───────────┘
                    │ Primer depósito validado
                    │ (código + llavero NFC asignado + pago aprobado)
                    ▼
         ┌──────────────────────┐
    ┌───►│      DEPOSITED       │  ← Llave guardada en el punto aliado.
    │    └──────────┬───────────┘     Puede generar códigos de recogida.
    │               │ Persona autorizada recoge
    │               │ (código válido + dentro del horario)
    │               ▼
    │    ┌──────────────────────┐
    │    │       IN_USE         │  ← Llave fuera de la tienda.
    │    └──────────┬───────────┘     No se pueden generar nuevos códigos.
    │               │ Propietario retorna llave
    │               │ (escaneo NFC del llavero)
    └───────────────┘

  Desde cualquier estado activo → DELETED
  (Borrado lógico: la llave desaparece de la operación pero el historial se conserva)
```

---

## 🔒 Seguridad Implementada

| Mecanismo | Tecnología | ¿Qué protege? |
|---|---|---|
| **Cifrado de contraseñas** | Bcrypt (salt = 10 rondas) | Las contraseñas se guardan irreversiblemente cifradas. Nadie puede recuperar la original. |
| **Autenticación por token** | JWT HS256, expira en 24h | Cada sesión tiene un token firmado. Sin él, ningún endpoint protegido responde. |
| **Protección contra duplicados** | Doble capa: verificación en app + `UNIQUE` en BD | Imposible registrar dos cuentas con el mismo correo, aunque se intente forzar a nivel de base de datos. |
| **Normalización de correos** | `toLowerCase()` + `trim()` | `MARIA@KEYGO.COM` y `maria@keygo.com ` son tratados como el mismo acceso. |
| **Validación de datos de entrada** | `class-validator` + `ValidationPipe` global | Ningún dato malformado llega a la lógica de negocio. |
| **Variables de entorno seguras** | `.env` excluido del repositorio | La URL de base de datos y el secreto JWT nunca se publican en el código fuente. |
| **Control de acceso por rol** | Roles `OWNER`, `STORE`, `ADMIN` en BD | Cada tipo de usuario solo ve y accede a lo que le corresponde. |

---

## 📖 API y Documentación Swagger

Con el servidor corriendo, la documentación interactiva está disponible en:

```
http://localhost:3000/api/docs
```

Desde Swagger se puede **probar cada endpoint directamente** sin necesidad de herramientas externas.

### `POST /auth/register` — Crear una cuenta nueva

```json
{
  "full_name": "María López",
  "email": "maria@keygo.com",
  "password": "contraseña123",
  "role": "OWNER"
}
```

| Código HTTP | Significado |
|---|---|
| `201 Created` | ✅ Cuenta creada exitosamente. La respuesta nunca incluye la contraseña. |
| `400 Bad Request` | ❌ Datos mal formados (correo inválido, contraseña muy corta, campo faltante). |
| `409 Conflict` | ⚠️ El correo ya está registrado en el sistema. |

### `POST /auth/login` — Iniciar sesión

```json
{
  "email": "maria@keygo.com",
  "password": "contraseña123"
}
```

| Código HTTP | Significado |
|---|---|
| `200 OK` | ✅ Login exitoso. Retorna el `access_token` (JWT) y los datos del usuario. |
| `400 Bad Request` | ❌ Datos mal formados. |
| `401 Unauthorized` | ❌ Contraseña incorrecta o cuenta desactivada. |

---

## 📱 App Móvil — Conexión con el Servidor

La App Móvil en **React Native + Expo** consume directamente la API del backend. El proceso de autenticación está completamente integrado:

1. El usuario ingresa sus credenciales en la pantalla de Login.
2. La App llama a `POST /auth/login` en el servidor.
3. El servidor valida y retorna un `access_token` JWT.
4. La App guarda el token en el contexto global (`AuthContext`).
5. El sistema detecta el **rol del usuario** y lo redirige automáticamente al panel correcto.

```
Pantalla de Login (index.tsx)
        │
        │  Credenciales correctas → el servidor retorna token + rol
        │
        ├──► rol OWNER  →  /(owner)/dashboard   (panel del propietario)
        │
        ├──► rol STORE  →  /(store)/dashboard   (panel del punto aliado)
        │
        └──► rol ADMIN  →  /(admin)/dashboard   (panel de administración)

¿No tienes cuenta? → register.tsx → POST /auth/register → Login automático
```

### Pantallas implementadas en la Fase 1

| Pantalla | Ruta | Descripción |
|---|---|---|
| Login | `/` (`index.tsx`) | Formulario de inicio de sesión conectado al servidor |
| Registro | `/register` | Formulario de creación de cuenta con validación en tiempo real |
| Dashboard Propietario | `/(owner)/dashboard` | Panel base del propietario (se expande en Fase 2) |
| Dashboard Tienda | `/(store)/dashboard` | Panel base del punto aliado (se expande en Fase 3) |
| Dashboard Admin | `/(admin)/dashboard` | Panel base de administración (se expande en Fase 5) |

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Backend (API)

```bash
cd keygo-backend
npm install
npm run start:dev
```

- **Servidor activo en:** `http://localhost:3000`
- **Documentación Swagger:** `http://localhost:3000/api/docs`

### 2. App Móvil

Abrir una segunda terminal:

```bash
cd keygo-app
npm install
npx expo start
```

- Presiona `W` para abrir en el navegador web.
- Escanea el código QR con la app **Expo Go** en tu celular.
- Presiona `A` para abrir en emulador Android.

> **En celular físico:** cambia `http://localhost:3000` por la IP local de tu computador en el archivo `services/api.ts`. Ejemplo: `http://192.168.1.10:3000`.

---

## 🔬 Guía de Pruebas para el Cliente

Estas pruebas validan que **todos los entregables de la Fase 1 están funcionando correctamente**.

### Prueba 1 — Registrar un Propietario (OWNER)
1. Ir a `http://localhost:3000/api/docs`
2. Expandir `POST /auth/register` → clic en **"Try it out"**
3. Ingresar:
```json
{ "full_name": "Carlos Propietario", "email": "carlos@keygo.com", "password": "clave123", "role": "OWNER" }
```
4. ✅ **Resultado esperado:** Código `201` con los datos del usuario (sin contraseña visible).

### Prueba 2 — Registrar un Punto Aliado (STORE)
1. Mismo endpoint, cambiar el cuerpo:
```json
{ "full_name": "Tienda El Centro", "email": "tienda@keygo.com", "password": "tienda123", "role": "STORE" }
```
2. ✅ **Resultado esperado:** Código `201` con rol `STORE` confirmado.

### Prueba 3 — Verificar protección contra duplicados
1. Intentar registrar `carlos@keygo.com` por segunda vez (sin cambiar nada).
2. ✅ **Resultado esperado:** Código `409` — *"El correo ya está registrado."*

### Prueba 4 — Verificar validación de datos
1. Enviar una contraseña de solo 3 caracteres (`"123"`).
2. ✅ **Resultado esperado:** Código `400` con el mensaje del campo inválido.

### Prueba 5 — Iniciar sesión
1. `POST /auth/login` con `carlos@keygo.com` / `clave123`
2. ✅ **Resultado esperado:** Código `200` con `access_token` (token JWT largo) y datos del usuario.

### Prueba 6 — Verificar rechazo de credenciales incorrectas
1. `POST /auth/login` con `carlos@keygo.com` y una contraseña equivocada.
2. ✅ **Resultado esperado:** Código `401` — *"Credenciales inválidas."*

### Prueba 7 — App Móvil conectada al servidor
1. Iniciar la app (`npx expo start` → `W`)
2. Ingresar con `carlos@keygo.com` / `clave123`
3. ✅ **Resultado esperado:** La app redirige al Dashboard del Propietario.
4. Cerrar sesión e ingresar con `tienda@keygo.com`
5. ✅ **Resultado esperado:** La app redirige al Dashboard de Tienda.

---

## ✅ Fase 2 — Entregable Completo

> **Compromiso pactado:** *"Backend: CRUD de Tiendas y Módulo de Llaves. Mobile: Interfaz 'Cliente' (Mis llaves, mapa, registro de llave). App Móvil y Web capaz de crear llaves, asignarlas a una tienda y generar códigos de acceso exitosamente."*

### Lo que se construyó en la Fase 2

| # | Módulo (Requerimiento) | Implementación | Estado |
|---|---|---|---|
| 1 | **Módulo 2 — Gestión de Llaves** | CRUD completo: crear, listar, ver detalle, editar, eliminar con borrado lógico. Estado inicial `WAITING_DEPOSIT`. Historial automático en `key_history`. | ✅ 100% |
| 2 | **Módulo 4A — Código de depósito** | Generación automática al crear la llave (formato `XXXX-XXXX`). Validación en tienda con reglas: código válido, estado de llave, soporte de error. | ✅ 100% |
| 3 | **Módulo 4B — Códigos de recogida** | Generación de `SINGLE_USE` y `REUSABLE`. Máx. 2 reutilizables activos. Control de horario (`active_from`). Cancelación manual. | ✅ 100% |
| 4 | **Módulo 8 — Puntos Aliados** | CRUD completo de stores: nombre, dirección, horario, WhatsApp, Google Maps, instrucciones. Borrado lógico. | ✅ 100% |
| 5 | **Módulo 9 — Mensaje Mágico** | `share_message` generado dinámicamente al crear código de recogida: incluye código, punto aliado, dirección, horario e instrucciones. Se comparte por WhatsApp, correo o copia. | ✅ 100% |
| 6 | **Módulo 10 — Historial** | `key_history` registra: llave creada, código generado, código cancelado, llave eliminada. Cada evento guarda fecha, hora, tipo de acción y observaciones. | ✅ 100% |
| 7 | **Lógica de estados (Transición 1)** | `WAITING_DEPOSIT → DEPOSITED → IN_USE → DELETED`. Reglas validadas: no se puede generar código si no está DEPOSITED, no se puede recoger si no está DEPOSITED. | ✅ 100% |
| 8 | **App Móvil — Dashboard OWNER** | "Hola [Nombre]", pestañas "Mis llaves" / "Puntos KeyGo", lista de llaves con bolas de color por estado (verde/amarillo/gris), FAB "Agregar llave". Fiel al prototipo. | ✅ 100% |
| 9 | **App Móvil — Crear llave** | 3 pasos: (1) Mapa con pines de tiendas + lista, (2) Nombre + plan + beneficios, (3) Éxito con código grande + instrucciones + botón compartir. Fiel al prototipo. | ✅ 100% |
| 10 | **App Móvil — Detalle de llave** | Estado, dirección, horario, Llavero Id (NFC), Plan. Botones: "Obtener código de recogida" (verde), "Ver mis códigos", "Ver movimientos". Modal de generación. Fiel al prototipo 4. | ✅ 100% |
| 11 | **App Móvil — Mis códigos** | Lista de códigos activos con "Copiar enlace mágico", Modificar, Eliminar. Tab Historial con códigos usados/cancelados y eventos. Fiel al prototipo 5. | ✅ 100% |
| 12 | **App Móvil — Dashboard STORE** | 3 pestañas: Validar (depósito/recogida), Mis llaves (depositadas en tienda), Puntos aliados. Drawer de configuración. Fiel al diseño del sistema. | ✅ 100% |

---

## 🏗️ Arquitectura Actualizada — Fase 2

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTES                                  │
│                                                                     │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │                   App Móvil (Expo)                         │    │
│   │                                                            │    │
│   │  OWNER:  Dashboard → "Mis llaves" → Crear llave            │    │
│   │          → Detalle → Generar código → Compartir            │    │
│   │          → Mis códigos → Historial                         │    │
│   │                                                            │    │
│   │  STORE:  Dashboard → "Validar código" → Resultado          │    │
│   │          → "Mis llaves" (en tienda) → Puntos aliados       │    │
│   └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                │   HTTP / REST (Axios + JWT Bearer Token)
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND — NestJS v11                             │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Auth    │  │  Users   │  │  Stores  │  │  Keys    │           │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│                                                                     │
│  ┌──────────┐  ┌──────────────────────────────────────────┐        │
│  │  Codes   │  │  Guards (JwtAuthGuard) +                 │        │
│  │  Module  │  │  Strategies (JwtStrategy + Passport)     │        │
│  └──────────┘  └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                │  ORM Prisma v6  (transacciones atómicas)
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│              BASE DE DATOS — PostgreSQL en Supabase                 │
│                                                                     │
│  users · stores · keys · key_tags · pickup_codes                    │
│  deposit_codes · key_movements · payments                           │
│  payment_methods · store_payouts · key_history · admin_actions      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas — Fase 2 Completa

```
KeyGo/
│
├── 📁 keygo-backend/
│   ├── 📁 src/
│   │   ├── 📁 auth/
│   │   ├── 📁 stores/                      ← Módulo 8: Puntos Aliados
│   │   ├── 📁 keys/                        ← Módulo 2: Gestión de Llaves
│   │   ├── 📁 codes/                       ← Módulos 4, 9, 10: Códigos + Mensajería + Historial
│   │   ├── 📁 users/
│   │   ├── 📁 prisma/
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── 📁 prisma/
│       └── schema.prisma                   (12 tablas — sin cambios)
│
└── 📁 keygo-app/
    ├── 📁 app/
    │   ├── 📁 (owner)/
    │   │   ├── _layout.tsx
    │   │   ├── dashboard.tsx               ← Mis llaves + Puntos KeyGo (prototipo 2)
    │   │   ├── create-key.tsx              ← 3 pasos: mapa → config → éxito (prototipos 3+)
    │   │   ├── key-detail.tsx              ← Detalle completo (prototipo 4)
    │   │   └── my-codes.tsx               ← Mis códigos + Historial (prototipo 5) ← NUEVO
    │   │
    │   ├── 📁 (store)/
    │   │   ├── _layout.tsx
    │   │   └── dashboard.tsx               ← Validar + Mis llaves + Puntos aliados
    │   │
    │   └── (admin)/, index.tsx, login.tsx, register.tsx
    │
    ├── 📁 services/
    │   ├── api.ts
    │   ├── auth.service.ts
    │   ├── store.service.ts
    │   ├── key.service.ts                  ← getById, getAll, create, delete, getHistory
    │   └── codes.service.ts               ← createPickupCode, validateDeposit, validatePickup
    │
    └── 📁 context/
        └── AuthContext.tsx
```

---

## 🔌 API de la Fase 2 — Nuevos Endpoints

> Todos los endpoints requieren el header: `Authorization: Bearer {access_token}`

### 🏪 Puntos Aliados — `/stores`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/stores` | Lista todos los puntos aliados activos |
| `GET` | `/stores/:id` | Detalle de un punto aliado |
| `POST` | `/stores` | Crear punto aliado (Admin) |
| `PATCH` | `/stores/:id` | Actualizar datos del punto |
| `DELETE` | `/stores/:id` | Desactivar punto aliado (borrado lógico) |

### 🔑 Llaves — `/keys`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/keys` | Crear llave → genera código de depósito automáticamente |
| `GET` | `/keys` | Mis llaves (del propietario autenticado) |
| `GET` | `/keys/:id` | Detalle completo de una llave |
| `PATCH` | `/keys/:id` | Actualizar nombre o foto de la llave |
| `DELETE` | `/keys/:id` | Eliminar llave (borrado lógico — historial conservado) |
| `GET` | `/keys/:id/history` | Historial completo de eventos de la llave |

### 🎟️ Códigos — `/codes`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/codes/pickup` | Generar código de recogida (owner) |
| `GET` | `/codes/pickup/key/:keyId` | Ver todos los códigos de una llave |
| `DELETE` | `/codes/pickup/:codeId` | Cancelar código de recogida |
| `POST` | `/codes/validate/deposit` | Validar código de depósito (tienda) |
| `POST` | `/codes/validate/pickup` | Validar código de recogida (tienda) |

---

## 🔄 Flujo Completo de la Llave — Fase 2

```
1. OWNER crea llave
   ├── Selecciona punto aliado (GET /stores)
   ├── Escoge plan (MONTHLY o PAY_PER_USE)
   └── POST /keys → Sistema genera código XXXX-XXXX automáticamente

2. OWNER recibe código de depósito
   └── Ve en la app: código + dirección del punto + horario + instrucciones

3. OWNER va a la tienda
   └── Entrega el código de depósito

4. STORE valida el código
   ├── POST /codes/validate/deposit → { valid: true, key: {...}, owner: {...} }
   └── Sistema indica: "Escanea el NFC del llavero para continuar"
       (El escaneo NFC y el cambio de estado se implementan en Fase 3)

5. OWNER genera código de recogida (cuando llave esté DEPOSITED)
   ├── POST /codes/pickup → { pickup_code: {...}, share_message: "..." }
   └── Comparte por WhatsApp/correo el mensaje prearmado

6. Persona autorizada va a la tienda
   └── Entrega el código de recogida

7. STORE valida el código de recogida
   ├── POST /codes/validate/pickup → Verifica: estado llave, horario, código activo
   └── Si válido: indica NFC a verificar y entrega la llave
```

---

## 🎟️ Lógica de Códigos de Recogida

### Tipos de código

| Tipo | Comportamiento |
|---|---|
| `SINGLE_USE` | Se invalida al usarse. No se puede reutilizar. |
| `REUSABLE` | Funciona múltiples veces. Máximo 2 activos simultáneamente. |

### Estados del código

| Estado | Significado |
|---|---|
| `ACTIVE` | Código válido y listo para usar |
| `PENDING_SCHEDULE` | Aún no llega la hora de activación (`active_from`) |
| `USED` | Fue utilizado (solo aplica a SINGLE_USE) |
| `CANCELLED` | Cancelado manualmente por el propietario |

### Validaciones en tienda (al presentar código de recogida)

1. ✅ El código existe en el sistema
2. ✅ Está en estado `ACTIVE` o `PENDING_SCHEDULE`
3. ✅ La llave está en estado `DEPOSITED`
4. ✅ Ya pasó la hora de activación (`active_from`), si aplica
5. ✅ No hay bloqueo por pago pendiente

Si alguna validación falla → el sistema retorna el error exacto + contacto de soporte.

---

## 🚀 Cómo Ejecutar el Proyecto — Fase 2

### 1. Backend

```bash
cd keygo-backend
npm install
npm run start:dev
```

- **Servidor activo en:** `http://localhost:3000`
- **Swagger:** `http://localhost:3000/api/docs`
- Nuevos grupos de endpoints: `🏪 Puntos Aliados`, `🔑 Llaves`, `🎟️ Códigos`

### 2. App Móvil

```bash
cd keygo-app
npm install
npx expo start
```

Presiona `W` para web, `A` para Android o escanea con **Expo Go** en tu celular.

> **Cambia la IP si usas celular físico:** edita `services/api.ts`, línea 4:
> `const API_URL = 'http://TU_IP_LOCAL:3000';`

---

## 🔬 Guía de Pruebas — Fase 2

Esta guía permite validar que el **Motor de Llaves y Códigos** está funcionando al 100% de acuerdo a la lógica de negocio y la base de datos real.

### Paso 0 — Requisito previo: Iniciar sesión y obtener Token

Para todas las pruebas de API en Swagger, primero debes autenticarte:
1. Ir a `POST /auth/login`
2. Enviar: `{ "email": "carlos@keygo.com", "password": "clave123" }`
3. Copiar el `access_token` recibido.
4. Clic en el botón **"Authorize"** (candado arriba a la derecha) y pegar el token.

---

### Prueba 1 — Crear un punto aliado (Módulo 8)
**Endpoint:** `POST /stores`
**Campos reales en tabla `Store`:** `store_name`, `address`, `city`, `main_phone`, `whatsapp`, `opening_hours`, `google_maps_link`.

```json
{
  "store_name": "Tienda La Esquina",
  "address": "Cl. 10 #45-12",
  "city": "Bogotá",
  "main_phone": "3001234567",
  "whatsapp": "573001234567",
  "opening_hours": "Lun-Sab 8am-8pm",
  "google_maps_link": "https://maps.google.com/?q=4.6097,-74.0817"
}
```
✅ **Resultado esperado:** `201 Created`. Se crea el registro en la tabla `stores` con estado `true`.

---

### Prueba 2 — Listar puntos aliados (Mapa)
**Endpoint:** `GET /stores`

✅ **Resultado esperado:** `200 OK`. Retorna un array con todas las tiendas. Estos son los datos que alimentan el **Mapa Interactivo** en la App Móvil.

---

### Prueba 3 — Crear una llave y obtener código de depósito (Módulo 2)
**Endpoint:** `POST /keys`
**Campos reales en tabla `Key`:** `key_name`, `store_id`, `plan_type`.

```json
{
  "key_name": "Llave Apartamento 301",
  "store_id": "ID_DE_LA_TIENDA_CREADA",
  "plan_type": "MONTHLY"
}
```
✅ **Resultado esperado:** `201 Created`. El sistema realiza tres acciones:
1. Crea la llave en la tabla `keys` con `key_status: WAITING_DEPOSIT`.
2. Genera automáticamente un registro en la tabla `deposit_codes` con un `code_value` único.
3. Registra el evento en `key_history`.

---

### Prueba 4 — Listar "Mis llaves" (Propietario)
**Endpoint:** `GET /keys`

✅ **Resultado esperado:** `200 OK`. Retorna las llaves del usuario autenticado. Verifica que el campo `key_status` sea el correcto y que incluya los datos de la tienda asociada.

---

### Prueba 5 — Validar código de depósito en tienda (Módulo 4)
**Endpoint:** `POST /codes/validate/deposit`
**Tabla:** `deposit_codes`

```json
{ "code_value": "XXXX-XXXX" }
```
✅ **Resultado esperado:** Retorna los datos de la llave y el propietario. Esto confirma que la tienda puede recibir la llave físicamente.

---

### Prueba 6 — Validación de Máquina de Estados (Seguridad)
**Endpoint:** `POST /codes/pickup` (Intentar generar recogida para llave no depositada)

✅ **Resultado esperado:** `400 Bad Request`. El backend rechaza la operación porque la llave aún está en `WAITING_DEPOSIT`. No se pueden generar recogidas si la llave no está físicamente en la tienda.

---

### Prueba 7 — App Móvil: Registro visual con Mapa
1. Iniciar sesión como **OWNER** en la app.
2. Tap en **"Agregar llave"**.
3. Seleccionar la tienda en el **Mapa Interactivo** (Pines azules).
4. ✅ **Resultado esperado:** Al finalizar, se muestra el código de depósito en una tarjeta premium con instrucciones de llegada.

---

### Prueba 8 — App Móvil: Dashboard en tiempo real
1. Ver la lista de llaves en el Dashboard.
2. ✅ **Resultado esperado:** La llave aparece con el estado "Esperando depósito" (color naranja/amarillo) y el nombre del punto aliado seleccionado.

---

### Prueba 9 — App Móvil: Validación en Tienda
1. Iniciar sesión como **STORE** (Punto Aliado).
2. Ir a la pestaña **"Validar"** e ingresar el código de la Prueba 3.
3. ✅ **Resultado esperado:** El sistema reconoce la llave y muestra la opción de "Vincular NFC" (preparado para la Fase 3).

---

### Prueba 10 — Cancelación y Trazabilidad (Módulo 10)
**Endpoint:** `DELETE /codes/pickup/:codeId`
**Tabla:** `pickup_codes`

✅ **Resultado esperado:** El estado del código cambia a `CANCELLED`. Si se intenta validar en tienda, el sistema mostrará un error indicando que el código ya no es válido.

---

---

## 📸 Demostración Visual — Fase 2 en Acción

> Las siguientes capturas son **reales** tomadas directamente de la App (localhost:8081) y de Prisma Studio (base de datos Supabase) en simultáneo. No son maquetas.

---

### 1️⃣ Dashboard del Propietario

El propietario ve sus llaves con iconos alternando **amarillo 🟡 / azul 🔵** y el estado de cada una.

![Dashboard – Mis Llaves](docs/screenshots/01_dashboard_mis_llaves.png)

> **Lo que ves en la base de datos →** tabla `Key`, campo `key_name` con nombres reales como "Casillero Crossfit Elite – Medellín" y `key_status = WAITING_DEPOSIT`.

---

### 2️⃣ Tabla `Key` en Prisma Studio (Base de Datos Real)

Cada tarjeta del Dashboard corresponde exactamente a una fila aquí. Muestra 8 registros con `key_name`, `key_status`, `plan_type` y `store_id` reales.

![Prisma Studio – Tabla Key](docs/screenshots/p2_prisma_key_table.png)

| Campo visible | Descripción |
|---|---|
| `key_name` | Nombre dado por el propietario (Casillero, Consultorio, Spa, etc.) |
| `key_status` | `WAITING_DEPOSIT` = aún no entregada al punto aliado |
| `plan_type` | `PAY_PER_USE` o `MONTHLY` según lo seleccionado en el Paso 2 |
| `store_id` | UUID del punto aliado elegido en el mapa |

---

### 3️⃣ Paso 1: Mapa Interactivo de Selección de Punto

Al tocar "+ Agregar llave", el sistema carga los puntos aliados en un mapa real. Solo al seleccionar uno se activa el botón Continuar.

![Mapa de Selección](docs/screenshots/03_mapa_seleccion.png)

---

### 4️⃣ Paso 2: Formulario de Configuración

El propietario nombra su llave y elige el plan. Este es el momento exacto donde se escribe en la base de datos.

![Paso 2 – Formulario Lleno](docs/screenshots/06_paso2_formulario_lleno.png)

---

### 5️⃣ Pantalla de Éxito — Código de Depósito Generado

Al confirmar, el backend genera automáticamente el código único. La pantalla muestra instrucciones completas para ir a la tienda.

![Pantalla de Éxito con Código](docs/screenshots/07_pantalla_exito_codigo.png)

---

### 6️⃣ Tabla `DepositCode` en Prisma Studio — Sincronización Inmediata

Cada código de la pantalla de éxito está exactamente aquí. **8 llaves = 8 códigos activos**, todos con `status = ACTIVE` y `used_at = null` (ninguno usado aún).

![Prisma Studio – Tabla DepositCode](docs/screenshots/p3_prisma_depositcode_table.png)

| Código visible en App | Campo en BD | Estado |
|---|---|---|
| `9SED-3XKY` | `code_value` | `ACTIVE` |
| `H3QP-Y86E` | `code_value` | `ACTIVE` |
| `H5PZ-W7X8` | `code_value` | `ACTIVE` |
| `AFF8-7GNJ` | `code_value` | `ACTIVE` |

---

### 7️⃣ Tabla `KeyHistory` — Auditoría Automática Completa

Cada acción genera registros aquí sin intervención manual. 16 eventos registrados: `CREATED` y `DEPOSIT_CODE_GENERATED` por cada llave creada.

![Prisma Studio – Tabla KeyHistory](docs/screenshots/p5_prisma_keyhistory_table.png)

| `event_type` | `new_value` | `notes` (ejemplo) |
|---|---|---|
| `CREATED` | `WAITING_DEPOSIT` | Llave "Casillero Box CrossFit" creada |
| `DEPOSIT_CODE_GENERATED` | `9SED-3XKY` | Código de depósito inicial generado |

---

### 8️⃣ Tabla `PickupCode` — La Regla de Negocio Verificada

`0 registros` en esta tabla prueba que el sistema **cumple la regla de seguridad** del cliente: ningún código de recogida puede generarse hasta que la llave esté físicamente en la tienda (`DEPOSITED`).

![Prisma Studio – Conteo de tablas](docs/screenshots/p1_prisma_home.png)

**Conteo de registros en tiempo real:**

| Tabla | Registros | Estado |
|---|---|---|
| `Key` | **8** | 8 llaves creadas ✅ |
| `DepositCode` | **8** | 1 código por llave ✅ |
| `KeyHistory` | **16** | 2 eventos por llave ✅ |
| `Store` | **6** | Puntos aliados disponibles ✅ |
| `PickupCode` | **0** | Correcto — llaves no depositadas aún ✅ |

---

### 9️⃣ Dashboard Actualizado con Pestaña "Puntos KeyGo"

El tab inactivo aparece en **amarillo** y el activo en **azul**, exactamente como el diseño del cliente.

![Dashboard – Puntos KeyGo](docs/screenshots/02_dashboard_puntos_keygo.png)

---

<p align="center">
  <strong>KeyGo · 2026</strong><br>
  <em>"Tus llaves, cuando las necesites."</em>
</p>
