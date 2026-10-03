import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building2, CalendarX, FileText, 
  Award, Folder, Settings, X, Fingerprint, LogOut, MapPin, Wifi, 
  AlertTriangle, CheckCircle, Clock
} from "lucide-react";
import api from "../api/axios";
import useIdleTimeout from "../hooks/useIdleTimeout";

const adminNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", path: "/employees", icon: Users },
  { label: "Leave", path: "/leaves", icon: CalendarX },
  { label: "Delays & Absences", path: "/absences", icon: CalendarX },
  { label: "Departments", path: "/departments", icon: Building2 },
  { label: "Contracts", path: "/contracts", icon: FileText },
  { label: "Evaluations", path: "/evaluations", icon: Award },
  { label: "Documents", path: "/documents", icon: Folder },
  { label: "Settings", path: "/settings", icon: Settings },
];

const employeeNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Leave", path: "/leaves", icon: CalendarX },
  { label: "Delays & Absences", path: "/absences", icon: CalendarX },
  { label: "Gmail", path: "https://mail.google.com/", isExternal: true },
  { label: "Settings", path: "/settings", icon: Settings },
];

// Couleurs selon le statut du pointage
const statusConfig = {
  "Non pointé": { color: "text-slate-400", bg: "bg-slate-100", dot: "bg-slate-400", label: "Non pointé" },
  "En ligne": { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500", label: "En ligne" },
  "Inactif": { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500", label: "Inactif" },
  "Terminé": { color: "text-slate-500", bg: "bg-slate-100", dot: "bg-slate-400", label: "Terminé" },
  "Anomalie": { color: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-500", label: "Anomalie" },
};

export default function Sidebar({ isOpen, onClose, user: propUser }) {
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUser = propUser || storedUser;
  const currentRole = (currentUser?.role || storedUser?.role || "").toLowerCase().trim();
  const isAdmin = currentRole === "admin";

  // Navigation adaptée : l'employé ne voit QUE ses rubriques (Employees et Departments sont strictement exclus)
  const visibleNavItems = isAdmin ? adminNavItems : employeeNavItems;

  const [pointage, setPointage] = useState(null);
  const [loadingPointage, setLoadingPointage] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Récupérer le pointage du jour au chargement
  useEffect(() => {
    fetchPointage();
  }, []);

  const fetchPointage = async () => {
    try {
      const res = await api.get("/pointage/me");
      setPointage(res.data);
    } catch (err) {
      console.error("Erreur récupération pointage:", err);
    }
  };

  // Callback appelé quand l'utilisateur est inactif (15 minutes)
  const handleIdle = useCallback(async () => {
    if (pointage && pointage.status === "En ligne") {
      try {
        await api.post("/pointage/status", { status: "Inactif" });
        fetchPointage();
      } catch (err) {
        console.error("Erreur mise à jour statut inactif:", err);
      }
    }
  }, [pointage]);

  // Callback appelé quand l'utilisateur redevient actif
  const isIdle = useIdleTimeout(handleIdle, 15 * 60 * 1000); // 15 minutes

  // Quand l'utilisateur redevient actif après une période d'inactivité
  useEffect(() => {
    if (!isIdle && pointage && pointage.status === "Inactif") {
      const reactivate = async () => {
        try {
          await api.post("/pointage/status", { status: "En ligne" });
          fetchPointage();
        } catch (err) {
          console.error("Erreur réactivation:", err);
        }
      };
      reactivate();
    }
  }, [isIdle]);

  // Géolocalisation + Clock In
  const handleClockIn = async () => {
    setLoadingPointage(true);
    setGeoError(null);

    // Demander la géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await api.post("/pointage/clock-in", {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setPointage(res.data);
          } catch (err) {
            setGeoError(err.response?.data?.message || "Erreur lors du pointage.");
          } finally {
            setLoadingPointage(false);
          }
        },
        async (error) => {
          // Si la géolocalisation est refusée, on pointe quand même mais sans coordonnées
          // Le backend marquera comme "Anomalie"
          console.warn("Géolocalisation refusée:", error.message);
          try {
            const res = await api.post("/pointage/clock-in", {});
            setPointage(res.data);
            setGeoError("Géolocalisation refusée — pointage enregistré avec anomalie.");
          } catch (err) {
            setGeoError(err.response?.data?.message || "Erreur lors du pointage.");
          } finally {
            setLoadingPointage(false);
          }
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // Navigateur sans support géolocalisation
      try {
        const res = await api.post("/pointage/clock-in", {});
        setPointage(res.data);
        setGeoError("Navigateur sans géolocalisation — anomalie enregistrée.");
      } catch (err) {
        setGeoError(err.response?.data?.message || "Erreur lors du pointage.");
      } finally {
        setLoadingPointage(false);
      }
    }
  };

  const handleClockOut = async () => {
    setLoadingPointage(true);
    try {
      const res = await api.post("/pointage/clock-out");
      setPointage(res.data);
    } catch (err) {
      setGeoError(err.response?.data?.message || "Erreur lors du pointage de départ.");
    } finally {
      setLoadingPointage(false);
    }
  };

  const currentStatus = pointage?.status || "Non pointé";
  const config = statusConfig[currentStatus] || statusConfig["Non pointé"];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 z-50 h-full w-64 bg-[#F8FAFC] border-r border-slate-200/80 
        flex flex-col justify-between p-6 shrink-0 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div>
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

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              if (item.isExternal) {
                return (
                  <a
                    key={item.label}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 group"
                    title="Ouvrir l'application Gmail"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M2 6C2 4.89543 2.89543 4 4 4H7V13.5L2 9.5V6Z" fill="#4285F4"/>
                        <path d="M17 4H20C21.1046 4 22 4.89543 22 6V9.5L17 13.5V4Z" fill="#34A853"/>
                        <path d="M2 9.5L12 17L22 9.5V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V9.5Z" fill="#EA4335"/>
                        <path d="M7 4L12 8L17 4H7Z" fill="#FBBC05"/>
                      </svg>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-500">
                      ↗
                    </span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
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

        {/* Badgeuse Pointage Widget */}
        <div className="space-y-3">
          <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Badgeuse Pointage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></span>
                <span className={`text-[10px] font-bold ${config.color}`}>{config.label}</span>
              </div>
            </div>

            {/* Horloge */}
            <div className="text-center mb-3">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {currentTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {currentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>

            {/* Heures pointées */}
            {pointage?.clockInTime && (
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-3 px-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Arrivée: <strong className="text-slate-800">{formatTime(pointage.clockInTime)}</strong></span>
                </div>
                {pointage.clockOutTime && (
                  <div className="flex items-center gap-1">
                    <LogOut className="w-3 h-3" />
                    <span>Départ: <strong className="text-slate-800">{formatTime(pointage.clockOutTime)}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Indicateurs de sécurité */}
            {pointage?.clockInTime && (
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  pointage.ipAddress ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}>
                  <Wifi className="w-2.5 h-2.5" /> IP
                </span>
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  pointage.location?.lat ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}>
                  <MapPin className="w-2.5 h-2.5" /> GPS
                </span>
                {currentStatus === "Anomalie" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600">
                    <AlertTriangle className="w-2.5 h-2.5" /> Anomalie
                  </span>
                )}
                {currentStatus === "En ligne" && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                    <CheckCircle className="w-2.5 h-2.5" /> Vérifié
                  </span>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            {currentStatus === "Non pointé" && (
              <button
                onClick={handleClockIn}
                disabled={loadingPointage}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4" />
                {loadingPointage ? "Pointage..." : "Pointer mon arrivée"}
              </button>
            )}

            {(currentStatus === "En ligne" || currentStatus === "Inactif" || currentStatus === "Anomalie") && !pointage?.clockOutTime && (
              <button
                onClick={handleClockOut}
                disabled={loadingPointage}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {loadingPointage ? "En cours..." : "Pointer mon départ"}
              </button>
            )}

            {currentStatus === "Terminé" && (
              <div className="text-center py-2">
                <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Journée terminée
                </span>
              </div>
            )}

            {/* Erreur géolocalisation */}
            {geoError && (
              <p className="text-[10px] text-rose-500 mt-2 text-center font-medium">
                {geoError}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}