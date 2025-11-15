import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../lib/translations';
import SmoothWavyCanvas from '@/components/ui/smooth-wavy-canvas';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Home, Users, UserPlus, LogOut } from 'lucide-react';
import Dock from '@/components/ui/Dock';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const dockItems = [
    {
      icon: <Home size={20} />,
      label: t('Home'),
      onClick: () => navigate('/')
    },
    {
      icon: <Users size={20} />,
      label: t('Customers'),
      onClick: () => navigate('/customers')
    },
    {
      icon: <UserPlus size={20} />,
      label: t('Add Customer'),
      onClick: () => navigate('/add-customer')
    },
    {
      icon: isDark ? <Sun size={20} /> : <Moon size={20} />,
      label: isDark ? t('Switch to Light Mode') : t('Switch to Dark Mode'),
      onClick: toggleTheme
    },
    {
      icon: <LogOut size={20} />,
      label: t('Logout'),
      onClick: handleLogout
    },
  ];

  return (
    <div className="min-h-screen relative pb-24">
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

      {/* Content */}
      <div className="relative z-10">
        <main className="container max-w-7xl mx-auto px-4 py-8">{children}</main>
      </div>

      {/* Dock Navigation */}
      <Dock
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
};