import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building2, CalendarX, FileText, 
  Award, Folder, Settings, X 
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", path: "/employees", icon: Users },
  { label: "Leaves & Absences", path: "/leaves", icon: CalendarX },
  { label: "Departments", path: "/departments", icon: Building2 },
  { label: "Contracts", path: "/contracts", icon: FileText },
  { label: "Evaluations", path: "/evaluations", icon: Award },
  { label: "Documents", path: "/documents", icon: Folder },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay Sombre pour Mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-full w-64 bg-[#F8FAFC] border-r border-slate-200/80 
        flex flex-col justify-between p-6 shrink-0 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div>
          {/* Header Mobile & Logo */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Stratos HR
              </span>
            </div>
            
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose} // Ferme automatiquement la barre latérale sur mobile
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all text-sm ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Support Box */}
        <div className="bg-[#0D1527] text-white p-4 rounded-xl relative overflow-hidden hidden sm:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Support</p>
          <p className="text-xs text-slate-300 leading-normal">
            Need help with the platform? Contact support.
          </p>
        </div>
      </aside>
    </>
  );
}