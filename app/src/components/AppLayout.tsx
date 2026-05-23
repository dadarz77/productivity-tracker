import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  TrendingUp,
  Users,
  Mail,
  Shield,
  Settings,
  LogOut,
  Menu,
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: PlusCircle, label: "New Decision", path: "/new-decision" },
  { icon: ListChecks, label: "My Decisions", path: "/decisions" },
  { icon: TrendingUp, label: "Progress", path: "/progress" },
];

const aiNav = [
  { icon: Brain, label: "AI Advisor", path: "/ai-advisor" },
];

const communityNav = [
  { icon: Users, label: "Public Forum", path: "/forum" },
  { icon: Mail, label: "Contact", path: "/contact" },
];

const bottomNav = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ icon: Icon, label, path }: { icon: React.ElementType; label: string; path: string }) => (
    <Link
      to={path}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
        isActive(path)
          ? "bg-[#00e5c0]/10 text-[#00e5c0] border-l-2 border-[#00e5c0]"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive(path) && "text-[#00e5c0]")} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-[#02040a] border-r border-white/10 flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight text-gradient">
              DECISIONPILOT
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
          {/* Main */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Main
              </p>
            )}
            {mainNav.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>

          {/* AI Tools */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                AI Tools
              </p>
            )}
            {aiNav.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>

          {/* Community */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Community
              </p>
            )}
            {communityNav.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>

          {/* Admin */}
          {isAdmin && (
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Admin
                </p>
              )}
              <NavItem icon={Shield} label="Admin" path="/admin" />
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {bottomNav.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#0a0f1a] border border-white/10 rounded-full items-center justify-center hover:border-[#00e5c0]/50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-white/10 bg-[#02040a]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-medium text-gray-300 hidden sm:block">
              {location.pathname === "/dashboard" && "Dashboard"}
              {location.pathname === "/new-decision" && "New Decision"}
              {location.pathname === "/decisions" && "My Decisions"}
              {location.pathname === "/progress" && "Progress"}
              {location.pathname === "/ai-advisor" && "AI Advisor"}
              {location.pathname === "/forum" && "Public Forum"}
              {location.pathname === "/contact" && "Contact"}
              {location.pathname === "/admin" && "Admin Dashboard"}
              {location.pathname === "/settings" && "Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5c0] to-[#a855f7] flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </div>
      </main>
    </div>
  );
}
