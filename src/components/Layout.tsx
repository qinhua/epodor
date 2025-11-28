import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Library,
  Zap,
  Activity,
  Cpu,
  Menu,
  X
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      id: "dashboard",
      label: "仪表盘",
      icon: LayoutDashboard,
      path: "/dashboard"
    },
    { id: "library", label: "元器件库", icon: Library, path: "/library" },
    { id: "simulation", label: "仿真实验室", icon: Zap, path: "/simulation" }
  ];

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
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative
      `}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 text-primary">
            <Cpu size={32} />
            <h1 className="text-2xl font-bold tracking-wider">EPODOR</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.path === "/library"
                  ? location.pathname.startsWith("/library")
                  : location.pathname === item.path;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                    ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                        : "text-muted hover:text-text hover:bg-white/5"
                    }
                  `}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              );
            })}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1] // 缓动曲线
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Background Grid Effect */}
        <div
          className="fixed inset-0 pointer-events-none z-[-1] opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </main>
    </div>
  );
};

export default Layout;
