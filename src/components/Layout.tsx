import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { t } from '../lib/translations';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo/Title - Right side in RTL */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">{t('CRM System')}</span>
          </Link>

          {/* Navigation - Center */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={
                isActive('/')
                  ? 'text-foreground transition-colors hover:text-foreground/80'
                  : 'text-foreground/60 transition-colors hover:text-foreground/80'
              }
            >
              {t('Home')}
            </Link>
            <Link
              to="/customers"
              className={
                isActive('/customers')
                  ? 'text-foreground transition-colors hover:text-foreground/80'
                  : 'text-foreground/60 transition-colors hover:text-foreground/80'
              }
            >
              {t('Customers')}
            </Link>
            <Link
              to="/add-customer"
              className={
                isActive('/add-customer')
                  ? 'text-foreground transition-colors hover:text-foreground/80'
                  : 'text-foreground/60 transition-colors hover:text-foreground/80'
              }
            >
              {t('Add Customer')}
            </Link>
          </nav>

          {/* User info - Left side in RTL */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              {t('Logout')}
            </Button>
          </div>
        </div>
      </header>
      <main className="container max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
};