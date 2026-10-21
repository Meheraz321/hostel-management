import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HostelProvider, useHostel } from './context/HostelContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { NotificationToasts } from './components/common/NotificationToasts';
import { LoginPage } from './components/auth/LoginPage';

// Module Views
import { Dashboard } from './components/dashboard/Dashboard';
import { RoomsMatrix } from './components/rooms/RoomsMatrix';
import { ResidentsList } from './components/residents/ResidentsList';
import { CheckInOutManager } from './components/residents/CheckInOutManager';
import { RoomTransfers } from './components/residents/RoomTransfers';
import { FinanceManager } from './components/finance/FinanceManager';
import { ExpensesManager } from './components/finance/ExpensesManager';
import { MessManager } from './components/mess/MessManager';
import { ComplaintsManager } from './components/operations/ComplaintsManager';
import { VisitorsSecurity } from './components/operations/VisitorsSecurity';
import { LeaveAttendance } from './components/operations/LeaveAttendance';
import { StaffManager } from './components/staff/StaffManager';
import { NoticeBoard } from './components/notices/NoticeBoard';
import { ReportsManager } from './components/reports/ReportsManager';
import { SettingsManager } from './components/settings/SettingsManager';
import { ResidentPortal } from './components/resident-portal/ResidentPortal';

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is resident, default to resident-portal
  React.useEffect(() => {
    if (user?.role === 'RESIDENT' && activeTab !== 'resident-portal') {
      setActiveTab('resident-portal');
    }
  }, [user?.role]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'ADD_RESIDENT':
        setActiveTab('checkin');
        break;
      case 'RECORD_PAYMENT':
        setActiveTab('finance');
        break;
      case 'REGISTER_VISITOR':
        setActiveTab('visitors');
        break;
      case 'ADD_EXPENSE':
        setActiveTab('expenses');
        break;
      case 'NEW_NOTICE':
        setActiveTab('notices');
        break;
      default:
        break;
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} onOpenQuickAction={handleQuickAction} />;
      case 'rooms':
        return <RoomsMatrix onNavigate={setActiveTab} onOpenQuickAction={handleQuickAction} />;
      case 'residents':
        return <ResidentsList onNavigate={setActiveTab} onOpenQuickAction={handleQuickAction} />;
      case 'checkin':
        return <CheckInOutManager onNavigate={setActiveTab} />;
      case 'transfers':
        return <RoomTransfers onNavigate={setActiveTab} />;
      case 'finance':
        return <FinanceManager onOpenQuickAction={handleQuickAction} />;
      case 'expenses':
        return <ExpensesManager />;
      case 'mess':
        return <MessManager />;
      case 'complaints':
        return <ComplaintsManager />;
      case 'visitors':
        return <VisitorsSecurity />;
      case 'leaves':
        return <LeaveAttendance />;
      case 'staff':
        return <StaffManager />;
      case 'notices':
        return <NoticeBoard />;
      case 'reports':
        return <ReportsManager />;
      case 'settings':
        return <SettingsManager />;
      case 'resident-portal':
        return <ResidentPortal />;
      default:
        return <Dashboard onNavigate={setActiveTab} onOpenQuickAction={handleQuickAction} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <Header
          onToggleMobile={() => setIsMobileSidebarOpen(prev => !prev)}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onOpenQuickAction={handleQuickAction}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette onNavigate={setActiveTab} />

      {/* Global Floating Toast Notifications */}
      <NotificationToasts />
    </div>
  );
};

export default function App() {
  return (
    <HostelProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HostelProvider>
  );
}
