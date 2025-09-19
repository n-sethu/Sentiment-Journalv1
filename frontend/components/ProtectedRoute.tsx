import React, { useEffect, useState } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../src/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { styles } from './protected-route/styles';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: FC<PropsWithChildren<ProtectedRouteProps>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting user session:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
