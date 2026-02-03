/*
  # Crear tabla de perfiles de usuario
  
  1. Nueva Tabla
    - `profiles`
      - `id` (uuid, FK a auth.users)
      - `email` (text, único)
      - `role` (text, valores: 'admin', 'user')
      - `created_at` (timestamp)
  
  2. Seguridad
    - Habilitar RLS en tabla profiles
    - Política de lectura: solo usuarios autenticados pueden ver su propio perfil
    - Política de inserción: automática vía trigger
  
  3. Automatización
    - Trigger para crear perfil automáticamente cuando se registra un nuevo usuario
    - Función para sincronizar datos de auth.users a profiles
*/

-- Crear tabla profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil al registrar usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Crear perfil admin si no existe (usando email del admin)
-- Primero verificamos si existe algún usuario con ese email en auth.users
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Buscar el user_id del admin en auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@gallardojoyeria.com' 
  LIMIT 1;
  
  -- Si existe el usuario, crear su perfil
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (admin_user_id, 'admin@gallardojoyeria.com', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;
