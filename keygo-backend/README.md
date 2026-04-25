# 🔑 KeyGo Backend - Fase 2 Completada

Sistema integral de gestión de llaves con arquitectura Full-Stack.

## 🚀 Estado del Proyecto: FASE 2 AL 100%
- [x] **Módulo 1:** Autenticación y Control de Roles (JWT).
- [x] **Módulo 2:** CRUD de Llaves y Estados Operativos.
- [x] **Módulo 4:** Lógica de Códigos (Depósito/Recogida).
- [x] **Módulo 8:** Gestión de Puntos Aliados (Tiendas).
- [x] **Conectividad:** Supabase (PostgreSQL) con SSL y Pooler Supavisor.

## 🧪 Cómo probar la Fase 2 (Entregables)

### 1. Interfaz de Cliente (App Mobile/Web)
- El cliente puede **Registrar una Llave** seleccionando un punto aliado desde el mapa.
- El sistema genera un **Código de Depósito** único.
- El cliente puede ver sus llaves y generar **Códigos de Recogida**.

### 2. Interfaz de Tienda
- La tienda puede validar los códigos que el cliente presenta.
- El sistema permite el flujo de registro de NFC al recibir la llave.

### 3. Base de Datos (Prisma + Supabase)
- Conexión estable con soporte para pooling.
- Trazabilidad de movimientos en la tabla `key_movements`.

---
*Configuración técnica:*
- Backend: NestJS / Prisma
- DB: Supabase (PostgreSQL)
- Auth: JWT con Roles (Admin, Store, Owner)
