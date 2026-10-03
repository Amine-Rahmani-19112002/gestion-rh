import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, Menu, User, ChevronDown } from "lucide-react";

export default function Topbar({ profile, onLogout, onOpenSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRole = (profile?.role || "").toLowerCase().trim();
  const isEmployee = currentRole === "employe" || currentRole === "employee";

  return (
    <header className="h-20 border-b border-slate-200/60 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 bg-[#F8FAFC]">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
          title="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search employees or docs..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-200/50 border border-transparent rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Accès direct Gmail pour les collaborateurs */}
        {isEmployee && (
          <a
            href="https://mail.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl text-slate-700 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200/80 hover:border-red-200 transition-all flex items-center gap-2 shadow-sm group cursor-pointer"
            title="Ouvrir l'application Gmail"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M2 6C2 4.89543 2.89543 4 4 4H7V13.5L2 9.5V6Z" fill="#4285F4"/>
              <path d="M17 4H20C21.1046 4 22 4.89543 22 6V9.5L17 13.5V4Z" fill="#34A853"/>
              <path d="M2 9.5L12 17L22 9.5V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V9.5Z" fill="#EA4335"/>
              <path d="M7 4L12 8L17 4H7Z" fill="#FBBC05"/>
            </svg>
            <span className="text-xs font-bold group-hover:text-red-600 hidden sm:inline">
              Gmail
            </span>
          </a>
        )}

        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/50 relative transition-all">
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-2 right-2"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-200/50 transition-all focus:outline-none"
          >
            <div className="w-9 h-9 bg-slate-800 text-white rounded-full flex items-center justify-center font-semibold text-xs overflow-hidden shadow-sm">
              {profile?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{profile?.name || "Alex Durand"}</p>
              <p className="text-[10px] text-slate-400 capitalize">
                {profile?.role === "admin" ? "HR Administrator" : profile?.role || "Employee"}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 md:hidden">
                <p className="text-xs font-bold text-slate-900">{profile?.name || "Alex Durand"}</p>
                <p className="text-[10px] text-slate-400 capitalize">{profile?.role || "Employee"}</p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/settings");
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Mon Profil / Paramètres
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}