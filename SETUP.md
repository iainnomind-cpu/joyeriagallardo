# Perlas AC - Setup Guide

Tu tienda de joyería ha sido convertida en una aplicación full-stack con todas las características que solicitaste.

## Características Implementadas

### Base de Datos Real
- PostgreSQL con Supabase
- Tablas: products, categories, orders, order_items
- Sincronización en tiempo real de productos

### API Backend
- Gestión completa de productos (crear, editar, eliminar)
- Sistema de pedidos con información del cliente
- Almacenamiento seguro con Row Level Security (RLS)

### Autenticación de Admin
- Login con email/password usando Supabase Auth
- Acceso protegido al panel de administración
- Logout seguro

### Envío de Emails
- Edge Function para notificaciones de pedidos
- Email automático cuando se crea un pedido nuevo
- Incluye detalles del pedido y cliente

### Hosting de Imágenes
- Supabase Storage para imágenes de productos
- Upload directo desde el panel de admin
- URLs públicas para las imágenes

## Cómo Crear el Usuario Admin

Para acceder al panel de administración, necesitas crear un usuario en Supabase:

1. Ve a tu Dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "Authentication" en el menú lateral
4. Haz clic en "Add User" (o "Users" > "Invite")
5. Ingresa un email y contraseña para el admin
6. Haz clic en "Create User"

Ejemplo:
- Email: admin@perlasac.com
- Password: TuContraseñaSegura123

## Cómo Usar la Aplicación

### Para Clientes

1. **Ver Productos**: Navega por las categorías (Perlas, Zirconia, Monedas)
2. **Buscar**: Usa la barra de búsqueda para encontrar productos por código o descripción
3. **Agregar al Carrito**: Haz clic en "Agregar" en cualquier producto
4. **Hacer Pedido**:
   - Abre el carrito (icono de carrito arriba a la derecha)
   - Ajusta cantidades si es necesario
   - Haz clic en "Continuar"
   - Completa tus datos personales
   - Elige tipo de entrega (Recoger en tienda o Envío a domicilio)
   - Si eliges envío, completa la dirección
   - Confirma tu pedido

### Para Administradores

1. **Login**:
   - Haz clic en el icono de configuración (⚙️) arriba a la derecha
   - Ingresa tu email y contraseña de admin
   - Haz clic en "Entrar"

2. **Agregar Producto**:
   - En el panel de admin, haz clic en "Nuevo Producto"
   - Completa código, precio y categoría (obligatorios)
   - Agrega descripción (opcional)
   - Sube una imagen (opcional)
   - Haz clic en "Guardar"

3. **Editar Producto**:
   - Busca el producto en el panel de admin
   - Haz clic en "Editar"
   - Modifica los campos necesarios
   - Haz clic en "Guardar"

4. **Eliminar Producto**:
   - Busca el producto en el panel de admin
   - Haz clic en "Eliminar"
   - Confirma la eliminación

5. **Ver Pedidos**:
   - Los pedidos se guardan en la base de datos
   - Puedes consultarlos directamente en Supabase Dashboard
   - Ve a "Table Editor" > "orders" para ver todos los pedidos
   - Ve a "Table Editor" > "order_items" para ver los productos de cada pedido

## Estructura de la Base de Datos

### Tabla: categories
- Categorías de productos (Perlas, Zirconia, Monedas)

### Tabla: products
- Código del producto
- Precio
- Categoría (relación con categories)
- URL de imagen
- Descripción

### Tabla: orders
- Datos del cliente (nombre, teléfono)
- Tipo de entrega (recoger/envío)
- Dirección de envío (si aplica)
- Total del pedido
- Estado (pendiente/completado/cancelado)
- Fecha de creación

### Tabla: order_items
- Productos incluidos en cada pedido
- Cantidad de cada producto
- Precio al momento de la compra

## Notificaciones por Email

Cuando un cliente hace un pedido:
1. Se guarda en la base de datos
2. Se ejecuta automáticamente la Edge Function "send-order-email"
3. La función recopila los datos del pedido
4. Genera un email con todos los detalles

## Tecnologías Utilizadas

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **Backend**: Supabase Edge Functions
- **Iconos**: Lucide React

## Productos de Ejemplo

La base de datos ya incluye 7 productos de ejemplo:
- 3 productos en categoría "Perlas"
- 2 productos en categoría "Zirconia"
- 2 productos en categoría "Monedas"

Puedes editarlos, eliminarlos o agregar más desde el panel de admin.

## Ventajas vs localStorage

### Antes (localStorage)
- Los datos se perdían al limpiar el navegador
- No había sincronización entre dispositivos
- Sin autenticación real
- Sin notificaciones
- Sin hosting de imágenes

### Ahora (Supabase)
- Datos persistentes y seguros
- Acceso desde cualquier dispositivo
- Autenticación real con email/password
- Notificaciones automáticas por email
- Imágenes hospedadas profesionalmente
- Escalable para múltiples usuarios
- Backups automáticos
