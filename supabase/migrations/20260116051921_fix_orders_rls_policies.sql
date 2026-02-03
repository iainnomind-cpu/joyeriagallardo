/*
  # Corregir políticas RLS para permitir pedidos anónimos

  1. Cambios en las políticas
    - Eliminar políticas antiguas restrictivas en `orders` y `order_items`
    - Crear nuevas políticas que permitan acceso anónimo (TO anon, authenticated)
    - Mantener acceso completo para usuarios autenticados (admins)
  
  2. Seguridad
    - Los usuarios anónimos pueden INSERT en orders y order_items (clientes haciendo pedidos)
    - Los usuarios autenticados pueden SELECT y UPDATE (administradores gestionando pedidos)
    - Esto permite que la tienda funcione sin requerir login para clientes
  
  3. Notas importantes
    - `TO anon` permite acceso a usuarios sin autenticar
    - `TO authenticated` permite acceso a usuarios autenticados (admins)
    - `WITH CHECK (true)` permite la operación sin restricciones
    - `USING (true)` permite leer/actualizar sin restricciones
*/

-- Eliminar políticas antiguas que causan el error
DROP POLICY IF EXISTS "Clientes anónimos pueden crear pedidos" ON orders;
DROP POLICY IF EXISTS "Admins pueden ver todos los pedidos" ON orders;
DROP POLICY IF EXISTS "Admins pueden actualizar pedidos" ON orders;
DROP POLICY IF EXISTS "Clientes anónimos pueden agregar items al pedido" ON order_items;
DROP POLICY IF EXISTS "Admins pueden ver todos los items de pedido" ON order_items;

-- Crear políticas correctas que permitan acceso anónimo
CREATE POLICY "Permitir insertar pedidos anónimamente"
ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Permitir leer pedidos (admin)"
ON orders
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir actualizar pedidos (admin)"
ON orders
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Permitir insertar items anónimamente"
ON order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Permitir leer items (admin)"
ON order_items
FOR SELECT
TO authenticated
USING (true);
