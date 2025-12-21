
import React, { useState } from 'react';
import { AppView, User, PlanTier } from './types';
import WebsiteApp from './components/WebsiteApp';
import PlatformApp from './components/PlatformApp';
import AuthScreen from './components/AuthScreen';
import { IconZap } from './components/Icons'; // Fix: Ensure IconZap is imported or used if needed, though this file mainly routes.

export default function App() {
  // --- APP VIEW STATE (ROUTER) ---
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingTrialUrl, setPendingTrialUrl] = useState<string | null>(null);

  // --- AUTH ACTIONS ---

  const handleStartTrial = (url: string) => {
    setPendingTrialUrl(url);
    setCurrentView('AUTH');
  };

  const handleLogin = () => {
    // Mock login
    const mockUser: User = {
      id: 'u1',
      name: 'Editor Pro',
      email: 'editor@stark.os',
      avatarUrl: 'https://i.pravatar.cc/150?u=stark',
      subscription: {
        plan: PlanTier.FREE,
        status: 'ACTIVE',
        renewsAt: new Date()
      },
      usage: {
        minutesUsed: 12,
        minutesLimit: 60
      }
    };
    setCurrentUser(mockUser);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('LANDING');
  };

  const handleUpgrade = (plan: PlanTier) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        subscription: { ...currentUser.subscription, plan }
      });
      alert(`Upgrade para o plano ${plan} realizado com sucesso! Bem-vindo à elite.`);
    }
  };

  // --- ROUTING RENDER ---

  if (currentView === 'LANDING') {
      return (
        <WebsiteApp 
           onStartTrial={handleStartTrial} 
           onLoginClick={() => setCurrentView('AUTH')} 
        />
      );
  }

  if (currentView === 'AUTH') {
      return (
        <AuthScreen 
           onLogin={handleLogin} 
           onGoBack={() => setCurrentView('LANDING')} 
        />
      );
  }

  // --- DASHBOARD (PROTECTED) ---
  if (currentView === 'DASHBOARD' && currentUser) {
      return (
        <PlatformApp 
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToSite={() => setCurrentView('LANDING')}
            onUpgradeUser={handleUpgrade}
            initialUrl={pendingTrialUrl || undefined}
        />
      );
  }

  return <div>Erro de Estado: Reinicie a página.</div>;
}
