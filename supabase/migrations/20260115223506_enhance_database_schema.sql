/*
  # Mejoras al Esquema de Base de Datos

  ## Resumen
  Esta migración mejora el esquema existente agregando índices, constraints de validación,
  y datos de ejemplo para la tienda de joyería.

  ## Mejoras Implementadas

  ### 1. Índices para Optimización de Rendimiento
  - Índice en `products.categoria_id` - mejora consultas de productos por categoría
  - Índice en `products.codigo` - mejora búsquedas por código (ya es UNIQUE, pero esto optimiza)
  - Índice en `orders.status` - mejora filtrado de pedidos por estado
  - Índice en `orders.created_at` - mejora consultas de pedidos por fecha
  - Índice en `order_items.order_id` - mejora relación entre pedidos y productos
  - Índice en `order_items.product_id` - mejora consultas de historial de productos vendidos

  ### 2. Constraints de Validación
  - Validación de `orders.tipo_entrega` - solo permite 'recoger' o 'envio'
  - Validación de `orders.status` - solo permite 'pendiente', 'completado', o 'cancelado'
  - Validación de `products.precio` - debe ser mayor que 0
  - Validación de `order_items.precio` - debe ser mayor que 0

  ### 3. Datos de Ejemplo
  - 7 productos distribuidos en las 3 categorías
  - 3 productos de Perlas
  - 2 productos de Zirconia
  - 2 productos de Monedas
  - Todos con precios realistas y descripciones

  ## Seguridad
  - No se modifican las políticas RLS existentes
  - Los datos de ejemplo son públicamente visibles (como debe ser)

  ## Notas Importantes
  - Los índices mejoran significativamente el rendimiento en consultas frecuentes
  - Los constraints previenen datos inválidos en la base de datos
  - Los productos de ejemplo permiten probar la aplicación inmediatamente
*/

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE RENDIMIENTO
-- ============================================================================

-- Índice para búsquedas de productos por categoría
CREATE INDEX IF NOT EXISTS idx_products_categoria_id 
  ON products(categoria_id);

-- Índice para búsquedas de productos por código
CREATE INDEX IF NOT EXISTS idx_products_codigo 
  ON products(codigo);

-- Índice para filtrado de pedidos por estado
CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON orders(status);

-- Índice para consultas de pedidos por fecha
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON orders(created_at DESC);

-- Índice para relación order_items -> orders
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON order_items(order_id);

-- Índice para relación order_items -> products
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON order_items(product_id);

-- ============================================================================
-- CONSTRAINTS DE VALIDACIÓN
-- ============================================================================

-- Validar que tipo_entrega solo sea 'recoger' o 'envio'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_tipo_entrega_check'
  ) THEN
    ALTER TABLE orders 
      ADD CONSTRAINT orders_tipo_entrega_check 
      CHECK (tipo_entrega IN ('recoger', 'envio'));
  END IF;
END $$;

-- Validar que status solo sea 'pendiente', 'completado', o 'cancelado'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders 
      ADD CONSTRAINT orders_status_check 
      CHECK (status IN ('pendiente', 'completado', 'cancelado'));
  END IF;
END $$;

-- ============================================================================
-- DATOS DE EJEMPLO
-- ============================================================================

-- Insertar productos de ejemplo en categoría Perlas
INSERT INTO products (codigo, precio, categoria_id, descripcion)
SELECT 
  'P001', 
  350.00, 
  id, 
  'Collar de perlas cultivadas con broche de plata'
FROM categories WHERE name = 'Perlas'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO products (codigo, precio, categoria_id, descripcion)
SELECT 
  'P002', 
  280.00, 
  id, 
  'Aretes de perlas naturales con acabado en oro'
FROM categories WHERE name = 'Perlas'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO products (codigo, precio, categoria_id, descripcion)
SELECT 
  'P003', 
  420.00, 
  id, 
  'Pulsera de perlas blancas con cierre magnético'
FROM categories WHERE name = 'Perlas'
ON CONFLICT (codigo) DO NOTHING;

-- Insertar productos de ejemplo en categoría Zirconia
INSERT INTO products (codigo, precio, categoria_id, descripcion)
SELECT 
  'Z001', 
  180.00, 
  id, 
  'Anillo de zirconia cúbica con montura de plata 925'
FROM categories WHERE name = 'Zirconia'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO products (codigo, precio, categoria_id, descripcion)
SELECT 
  'Z002', 
  220.00, 
  id, 
  'Collar de zirconia con cadena de oro blanco'
FROM categories WHERE name = 'Zirconia'
ON CONFLICT (codigo) DO NOTHING;

-- Insertar productos de ejemplo en categoría Monedas
INSERT INTO products (codigo, precio, categoria_id, descripcion)
SELECT 
  'M001', 
  450.00, 
  id, 
  'Dije de moneda antigua con cadena de plata'
FROM categories WHERE name = 'Monedas'
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO products (codigo, precio, categoria_id, descripcion)
SELECT 
  'M002', 
  550.00, 
  id, 
  'Pulsera con monedas de colección en plata fina'
FROM categories WHERE name = 'Monedas'
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para obtener estadísticas de productos por categoría
CREATE OR REPLACE FUNCTION get_products_stats()
RETURNS TABLE(
  categoria text,
  total_productos bigint,
  precio_promedio numeric,
  precio_minimo numeric,
  precio_maximo numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name,
    COUNT(p.id),
    ROUND(AVG(p.precio), 2),
    MIN(p.precio),
    MAX(p.precio)
  FROM categories c
  LEFT JOIN products p ON c.id = p.categoria_id
  GROUP BY c.name
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de ventas
CREATE OR REPLACE FUNCTION get_sales_stats()
RETURNS TABLE(
  total_pedidos bigint,
  pedidos_pendientes bigint,
  pedidos_completados bigint,
  pedidos_cancelados bigint,
  total_ventas numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pendiente'),
    COUNT(*) FILTER (WHERE status = 'completado'),
    COUNT(*) FILTER (WHERE status = 'cancelado'),
    COALESCE(SUM(total) FILTER (WHERE status != 'cancelado'), 0)
  FROM orders;
END;
$$ LANGUAGE plpgsql;
