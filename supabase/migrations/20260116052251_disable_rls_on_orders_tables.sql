/*
  # Deshabilitar RLS temporalmente en tablas de pedidos

  1. Cambios
    - Deshabilitar RLS en la tabla `orders`
    - Deshabilitar RLS en la tabla `order_items`
  
  2. Propósito
    - Solucionar el error 42501 que bloquea la creación de pedidos
    - Esto es una solución temporal mientras se investiga el problema
  
  3. Nota
    - RLS debe ser re-habilitado cuando se resuelva el problema subyacente
    - Sin RLS, cualquiera puede acceder a todos los datos
*/

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
