import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DynamicInput } from '@/components/ui/dynamic-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Moon, Sun } from 'lucide-react';
import { handleError } from '../lib/errorHandling';
import { t } from '../lib/translations';
import SmoothWavyCanvas from '@/components/ui/smooth-wavy-canvas';
import { useTheme } from '../hooks/useTheme';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error: unknown) {
      const errorDetails = handleError(error);
      setError(errorDetails.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="h-10 w-10 bg-background/80 backdrop-blur"
          title={isDark ? t('Switch to Light Mode') : t('Switch to Dark Mode')}
        >
          {isDark ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <SmoothWavyCanvas
          backgroundColor={isDark ? "#0a0a0a" : "#ffffff"}
          primaryColor={isDark ? "120, 120, 120" : "140, 140, 140"}
          secondaryColor={isDark ? "140, 140, 140" : "120, 120, 120"}
          accentColor={isDark ? "160, 160, 160" : "100, 100, 100"}
          lineOpacity={isDark ? 0.7 : 0.6}
          animationSpeed={0.003}
        />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('CRM Login')}</CardTitle>
          <CardDescription>
            {t('Enter your credentials to access the admin panel')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <span className="text-destructive">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('Email')}</Label>
              <DynamicInput
                id="email"
                type="email"
                placeholder={t('admin@example.com')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('Password')}</Label>
              <DynamicInput
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('Signing in...') : t('Sign In')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};