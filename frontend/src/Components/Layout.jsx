import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
      } catch (err) {
        console.error("Erreur de chargement du profil", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-slate-500 font-medium animate-pulse">Chargement de Stratos HR...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 antialiased overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar 
          profile={profile} 
          onLogout={handleLogout} 
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-[1500px] w-full">
          <Outlet context={{ profile }} />
        </main>
      </div>
    </div>
  );
}