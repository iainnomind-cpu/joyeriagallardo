import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Intentando iniciar sesión para:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error de Supabase Auth:', error.status, error.message);
      throw error;
    }

    console.log('Sesión de Supabase iniciada correctamente:', data.user?.id);

    if (data.user) {
      console.log('Verificando perfil en la tabla "profiles"...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error al consultar la tabla "profiles":', profileError);
        await supabase.auth.signOut();
        throw new Error(`Error de base de datos: ${profileError.message}`);
      }

      console.log('Perfil encontrado:', profile);

      if (!profile) {
        console.warn('No se encontró perfil para el usuario. El trigger handle_new_user podría haber fallado.');
        // Opcional: Podrías permitir el acceso si confías en que el usuario de Auth es el admin de confianza
        // Por ahora, lanzamos un error claro
        await supabase.auth.signOut();
        throw new Error('Usuario autenticado pero sin perfil configurado. Contacta soporte.');
      }

      if (profile.role !== 'admin') {
        console.warn(`Usuario ${email} tiene rol "${profile.role}", se requiere "admin"`);
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado: Tu cuenta tiene rol "${profile.role}" y se requiere ser administrador.`);
      }
      
      console.log('Acceso concedido como administrador');
    }

    return data;
  };

  const signOut = async () => {
    console.log('Cerrando sesión...');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
