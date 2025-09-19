import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import Button from '../../components/button';
import Input from '../../components/input';
import Card from '../../components/card';
import { styles } from './login/styles';

const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setError('Check your email for the confirmation link!');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={styles.container}>
      <Card variant="elevated" className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to Sentiment Journal</h1>
          <p className={styles.subtitle}>
            Track your emotions and gain insights with AI-powered analysis
          </p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={!!error && error.includes('email')}
            errorMessage={error.includes('email') ? error : undefined}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!error && error.includes('password')}
            errorMessage={error.includes('password') ? error : undefined}
          />

          {error && !error.includes('email') && !error.includes('password') && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.buttonGroup}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={loading}
              className={styles.loginButton}
            >
              Sign In
            </Button>

            <Button
              type="button"
              variant="outline"
              size="large"
              onClick={handleSignUp}
              loading={loading}
              className={styles.signUpButton}
            >
              Sign Up
            </Button>
          </div>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            New to Sentiment Journal? Sign up to start tracking your emotions and 
            get personalized insights powered by AI.
          </p>
          {(!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')) && (
            <div className={styles.demoMode}>
              <p className={styles.demoText}>
                🚀 <strong>Demo Mode:</strong> To enable full functionality, set up Supabase and add your credentials to the .env file.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
