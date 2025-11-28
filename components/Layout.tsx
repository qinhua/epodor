import React, { useState } from 'react';
import { LayoutDashboard, Library, Zap, Activity, Cpu, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'library', label: '元器件库', icon: Library },
    { id: 'simulation', label: '仿真实验室', icon: Zap },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background text-text overflow-hidden font-sans">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-border rounded-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 text-primary">
            <Cpu size={32} />
            <h1 className="text-2xl font-bold tracking-wider">EPODOR</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${activePage === item.id 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'text-muted hover:text-text hover:bg-white/5'}
                `}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted">
              <Activity size={16} className="text-emerald-500 animate-pulse" />
              <span>系统运行中</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
        
        {/* Background Grid Effect */}
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
               backgroundSize: '40px 40px' 
             }} 
        />
      </main>
    </div>
  );
};

export default Layout;