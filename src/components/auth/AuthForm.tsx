import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSupabase } from '@/lib/providers/supabase-context';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setIsLoading(true);
    setError(null);
    setSignUpSuccess(false);

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        navigate('/adventure');
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user && !data.user.email_confirmed_at) {
          setSignUpSuccess(true);
          setEmail('');
          setPassword('');
        } else if (data.user && data.user.email_confirmed_at) {
          // User is already confirmed, redirect to adventure
          navigate('/adventure');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Error signing out');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>You are currently signed in as {user.email}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleSignOut} variant="outline" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner /> : 'Sign Out'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (signUpSuccess) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Created!</CardTitle>
          <CardDescription>
            Please check your email to confirm your account. Once confirmed, you can sign in.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => {
              setMode('login');
              setSignUpSuccess(false);
              setError(null);
            }}
            className="w-full"
          >
            Return to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="card-solid mx-auto w-full max-w-md" data-testid="auth-form">
      <CardHeader>
        <CardTitle>{mode === 'login' ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Enter your email and password to sign in'
            : 'Create a new account to get started'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoComplete={mode === 'login' ? 'email' : 'username'}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'signup' && (
              <p className="text-muted-foreground text-xs">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          {error && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive rounded border p-2 text-sm">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setSignUpSuccess(false);
            }}
            disabled={isLoading}
          >
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
