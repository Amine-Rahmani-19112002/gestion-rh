import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Users, CalendarX, Award, 
  UserPlus, CheckSquare, FilePlus, MoreHorizontal, Calendar, ArrowRight,
  Phone, Mail, Bell, Clock, Laptop, CheckCircle2, AlertTriangle, RefreshCw
} from "lucide-react";
import api from "../api/axios";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        api.get("/auth/me").catch((err) => {
          console.error("Erreur chargement profil:", err);
          return { data: null };
        }),
        api.get("/dashboard/stats").catch((err) => {
          console.error("Erreur chargement stats:", err);
          return { data: null };
        }),
      ]);

      if (profileRes?.data) setProfile(profileRes.data);
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      console.error("Erreur générale Dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculs dynamiques pour les jauges
  const presenceRate = stats?.cards?.presenceRate ?? 100;
  const onSiteCount = stats?.cards?.onSiteCount ?? 0;
  const teleworkCount = stats?.cards?.teleworkToday ?? 0;
  const totalOnWork = onSiteCount + teleworkCount;
  const onSitePercent = totalOnWork > 0 ? Math.round((onSiteCount / totalOnWork) * 100) : 80;
  const teleworkPercent = 100 - onSitePercent;

  // Calcul du décalage SVG pour le camembert (Donut)
  const donutItems = stats?.motifsAbsence?.items || [
    { name: "Congés payés", percent: 45, color: "#2563eb" },
    { name: "Maladie / AT", percent: 30, color: "#64748b" },
    { name: "RTT & Récup", percent: 15, color: "#93c5fd" },
    { name: "Retards / Non just.", percent: 10, color: "#e11d48" },
  ];

  let cumulativePercent = 0;

  const isEmployee = stats?.isEmployee || profile?.role === "employe";

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "--:--" : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
  };

  // =========================================================================
  // VUE TABLEAU DE BORD COLLABORATEUR (EMPLOYÉ)
  // =========================================================================
  if (isEmployee) {
    const currentStatus = stats?.cards?.currentStatus || "Non pointé";

    return (
      <div className="space-y-6 max-w-[1500px]">
        {/* HEADER COLLABORATEUR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Espace Collaborateur
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bonjour, {profile?.name || "Collaborateur"} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Bienvenue sur votre espace personnel. Retrouvez ici le suivi de vos présences, pointages et congés.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
              <span>{refreshing ? "Mise à jour..." : "Actualiser"}</span>
            </button>
          </div>
        </div>

        {/* 4 CARTES KPI PERSONNELLES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* CARTE 1 : MON STATUT AUJOURD'HUI */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Mon statut<br/>aujourd'hui</h3>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-4">
              <span className="text-xl font-extrabold text-slate-900 block truncate">
                {currentStatus}
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.cards?.clockInTime
                  ? `Pointé à ${formatTime(stats.cards.clockInTime)}`
                  : "Pas encore pointé ce matin"}
              </p>
            </div>
            <div className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Badgeuse active dans la barre latérale
            </div>
          </div>

          {/* CARTE 2 : MES CONGÉS EN ATTENTE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Congés en attente<br/>de validation</h3>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <CalendarX className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats?.cards?.pendingLeaves ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">demande(s)</span>
            </div>
            <Link
              to="/leaves"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-between"
            >
              <span>Suivre mes demandes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* CARTE 3 : MES CONGÉS VALIDÉS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Congés validés<br/>par les RH</h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-slate-900">
                {stats?.cards?.approvedLeaves ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">approuvé(s)</span>
            </div>
            <Link
              to="/leaves"
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center justify-between"
            >
              <span>Poser un nouveau congé</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* CARTE 4 : MON BILAN DU MOIS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Mon bilan présence<br/>ce mois</h3>
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <Laptop className="w-5 h-5" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="block text-sm font-bold text-slate-800">{stats?.cards?.delaysThisMonth ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Retards</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="block text-sm font-bold text-slate-800">{stats?.cards?.absencesThisMonth ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Absences</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-lg">
                <span className="block text-sm font-bold text-emerald-600">{stats?.cards?.teleworkThisMonth ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Télétravail</span>
              </div>
            </div>
            <Link
              to="/absences"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 hover:underline flex items-center justify-between"
            >
              <span>Voir mes signalements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* CONTENU PRINCIPAL COLLABORATEUR : 2 COLONNES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLONNE GAUCHE (2/3) : MES DERNIÈRES DEMANDES DE CONGÉ */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Mes Demandes de Congé Récentes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Historique de vos congés soumis et leur état de traitement</p>
              </div>
              <Link
                to="/leaves"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>Nouvelle demande</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats?.myRecentLeaves && stats.myRecentLeaves.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-2.5">Type de congé</th>
                      <th className="py-2.5">Période</th>
                      <th className="py-2.5">Durée</th>
                      <th className="py-2.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {stats.myRecentLeaves.map((leave, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-bold text-slate-900">{leave.typeConge}</td>
                        <td className="py-3">
                          {formatDate(leave.dateDebut)} → {formatDate(leave.dateFin)}
                        </td>
                        <td className="py-3">{leave.nombreJours} jour(s)</td>
                        <td className="py-3">
                          {leave.statut === "Approuvé" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Approuvé
                            </span>
                          )}
                          {leave.statut === "En attente" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" /> En attente
                            </span>
                          )}
                          {leave.statut === "Refusé" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              <AlertTriangle className="w-3 h-3" /> Refusé
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Aucune demande de congé récente</p>
                <p className="text-[11px] text-slate-400 mt-1">Vous n'avez pas encore déposé de demande.</p>
                <Link
                  to="/leaves"
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Poser une demande
                </Link>
              </div>
            )}
          </div>

          {/* COLONNE DROITE (1/3) : RACCOURCIS & DERNIERS SIGNALEMENTS */}
          <div className="space-y-6">
            {/* DERNIERS SIGNALEMENTS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Mes Signalements Récents</h3>
                <Link to="/absences" className="text-xs font-bold text-blue-600 hover:underline">
                  Voir tout
                </Link>
              </div>

              {stats?.myRecentAbsences && stats.myRecentAbsences.length > 0 ? (
                <div className="space-y-3">
                  {stats.myRecentAbsences.map((abs, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{abs.type}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(abs.date)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 truncate max-w-[140px]">{abs.motif || "Sans motif"}</span>
                        {abs.justifiee ? (
                          <span className="text-emerald-600 font-bold">Justifiée</span>
                        ) : (
                          <span className="text-amber-600 font-bold">À justifier</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Aucun retard ou absence enregistré ce mois.
                </div>
              )}
            </div>

            {/* RACCOURCIS RAPIDES */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-slate-900 mb-2">Actions Rapides</h3>
              <Link
                to="/leaves"
                className="w-full p-3 bg-blue-50/60 hover:bg-blue-100/60 border border-blue-100 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900 transition-all"
              >
                <span>Faire une demande de congé</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
              <Link
                to="/absences"
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 transition-all"
              >
                <span>Consulter mes justificatifs</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VUE TABLEAU DE BORD ADMINISTRATEUR (VUE GLOBALE ENTREPRISE RH)
  // =========================================================================
  return (
    <div className="space-y-6 max-w-[1500px]">
      {/* HEADER AVEC TITRE ET BOUTON RAFRAÎCHIR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour, {profile?.name || "Administrateur"} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Voici un aperçu en temps réel de l'activité RH et de la présence aujourd'hui.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Rafraîchir les statistiques"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span>{refreshing ? "Mise à jour..." : "Actualiser"}</span>
          </button>
        </div>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARTE 1 : TAUX DE PRÉSENCE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">Taux de présence<br/>aujourd'hui</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-extrabold text-slate-900">{presenceRate}%</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              presenceRate >= 90 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
            }`}>
              {presenceRate >= 90 ? "↑ Normal" : "↓ Bas"}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 flex overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-l-full transition-all duration-500" style={{ width: `${onSitePercent}%` }} title={`Sur site : ${onSiteCount}`}></div>
            <div className="bg-blue-900 h-1.5 rounded-r-full transition-all duration-500" style={{ width: `${teleworkPercent}%` }} title={`Télétravail : ${teleworkCount}`}></div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span><strong className="text-slate-800">{onSiteCount}</strong> sur site</span>
            <span><strong className="text-slate-800">{teleworkCount}</strong> télétravail</span>
          </div>
        </div>

        {/* CARTE 2 : RETARDS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">Retards signalés ce<br/>matin</h3>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <CalendarX className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.cards?.delaysToday ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {(stats?.cards?.delaysToday || 0) > 1 ? "collaborateurs" : "collaborateur"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium">
              Moyenne : {stats?.cards?.avgDelayMinutes ?? 0} min
            </span>
            <Link to="/absences" className="text-blue-600 font-medium hover:underline">
              Voir détails
            </Link>
          </div>
        </div>

        {/* CARTE 3 : ABSENCES DU JOUR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">Absences du<br/>jour</h3>
            {(stats?.cards?.unjustifiedToday || 0) > 0 ? (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100 animate-pulse">
                {stats.cards.unjustifiedToday} alerte{stats.cards.unjustifiedToday > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                À jour
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.cards?.absencesToday ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">total au registre</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg py-1.5">
              <span className="block text-sm font-bold text-slate-800">
                {stats?.cards?.congesToday ?? 0}
              </span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Congés</span>
            </div>
            <div className="bg-slate-50 rounded-lg py-1.5">
              <span className="block text-sm font-bold text-slate-800">
                {stats?.cards?.maladieToday ?? 0}
              </span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Maladie</span>
            </div>
            <div className={`rounded-lg py-1.5 ${
              (stats?.cards?.unjustifiedToday || 0) > 0
                ? "bg-rose-50 border border-rose-100"
                : "bg-slate-50"
            }`}>
              <span className={`block text-sm font-bold ${
                (stats?.cards?.unjustifiedToday || 0) > 0 ? "text-rose-600" : "text-slate-800"
              }`}>
                {stats?.cards?.unjustifiedToday ?? 0}
              </span>
              <span className={`block text-[9px] font-bold uppercase ${
                (stats?.cards?.unjustifiedToday || 0) > 0 ? "text-rose-500" : "text-slate-400"
              }`}>
                Injustifiées
              </span>
            </div>
          </div>
        </div>

        {/* CARTE 4 : DEMANDES EN ATTENTE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-800">Demandes en attente</h3>
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.cards?.pendingLeaves ?? 0}
            </span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Congés à valider
            </span>
          </div>
          <Link
            to="/leaves"
            className="flex items-center justify-between text-xs text-slate-500 font-medium hover:text-blue-600 transition-colors"
          >
            <span>
              {stats?.cards?.pendingLeaves ?? 0} demande{(stats?.cards?.pendingLeaves || 0) > 1 ? "s" : ""} en attente
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </Link>
        </div>
      </div>

      {/* ROW 2: Ponctualité & Assiduité par Département & Absences Non Justifiées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PAR DÉPARTEMENT */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ponctualité & Assiduité par Département</h3>
              <p className="text-xs text-slate-500 mt-1">Comparaison hebdomadaire du taux de présence effectif</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Présence effective</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> Cible (95%)</span>
            </div>
          </div>

          <div className="space-y-5 pt-4">
            {stats?.employeesByDepartment && stats.employeesByDepartment.length > 0 ? (
              stats.employeesByDepartment.map((dept, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <p className="text-sm font-bold text-slate-800 truncate" title={dept.name}>{dept.name}</p>
                    <p className="text-[10px] text-slate-500">{dept.count}</p>
                  </div>
                  <div className="flex-1 relative flex items-center">
                    <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden flex relative">
                       <div 
                         className="bg-blue-600 h-full flex items-center px-3 transition-all duration-500" 
                         style={{ width: `${Math.min(100, Math.max(15, dept.rate))}%` }}
                       >
                          <span className="text-white text-xs font-bold">{dept.rate}%</span>
                       </div>
                    </div>
                    {dept.retard > 0 ? (
                       <span className="absolute right-3 text-slate-700 text-xs font-bold bg-white/80 px-2 py-0.5 rounded shadow-sm">
                         {dept.retard} retard{dept.retard > 1 ? "s" : ""}
                       </span>
                    ) : (
                       <span className="absolute right-3 text-slate-500 text-xs font-semibold bg-white/80 px-2 py-0.5 rounded">
                         0 retard
                       </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Aucun collaborateur ou département enregistré pour le moment.
              </div>
            )}
            <div className="flex items-center justify-between pl-36 pr-4 text-[10px] font-medium text-slate-400 mt-2">
               <span>85%</span>
               <span>90%</span>
               <span>95% (Cible)</span>
               <span>100%</span>
            </div>
          </div>
        </div>

        {/* ABSENCES NON JUSTIFIÉES (ALERTES URGENTES) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                 <Bell className="w-5 h-5" />
               </div>
               <h3 className="text-base font-bold text-slate-900 leading-tight">Absences Non<br/>Justifiées</h3>
             </div>
             {(stats?.unjustifiedAbsencesList?.length || 0) > 0 ? (
               <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                 {stats.unjustifiedAbsencesList.length} urgence{stats.unjustifiedAbsencesList.length > 1 ? "s" : ""}
               </span>
             ) : (
               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                 Aucune
               </span>
             )}
          </div>
          
          <p className="text-xs text-slate-500 mb-6">
            Collaborateurs absents sans déclaration préalable. Une prise de contact immédiate est requise par la convention RH.
          </p>

          <div className="space-y-4 mb-auto">
            {stats?.unjustifiedAbsencesList && stats.unjustifiedAbsencesList.length > 0 ? (
              stats.unjustifiedAbsencesList.map((abs, idx) => {
                const emp = abs.employee;
                const initials = emp ? `${emp.prenom?.[0] || ""}${emp.nom?.[0] || ""}`.toUpperCase() : "??";
                return (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {initials}
                      </div>
                      <div className="max-w-[130px] sm:max-w-none">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {emp ? `${emp.prenom} ${emp.nom}` : "Collaborateur inconnu"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {emp?.poste || "Poste non défini"} • {emp?.departement || "RH"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {emp?.telephone && (
                        <a 
                          href={`tel:${emp.telephone}`} 
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title={`Appeler ${emp.telephone}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {emp?.email && (
                        <a 
                          href={`mailto:${emp.email}`} 
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title={`Envoyer un email à ${emp.email}`}
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-slate-700">Aucune alerte en attente</p>
                <p className="text-[11px] text-slate-400 mt-1">Tous les absents sont justifiés aujourd'hui.</p>
              </div>
            )}
          </div>

          <Link
            to="/absences"
            className="block text-center w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all mt-6 shadow-sm"
          >
            Déclencher protocole relance RH
          </Link>
        </div>
      </div>

      {/* ROW 3: Derniers Incidents du Jour, Motifs d'Absence, Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* DERNIERS INCIDENTS */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-4">
             <div>
               <div className="flex items-center gap-3">
                 <h3 className="text-base font-bold text-slate-900">Derniers Incidents du Jour</h3>
                 <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">En direct</span>
               </div>
               <p className="text-xs text-slate-500 mt-1">Journal des anomalies et signalements récents</p>
             </div>
             <Link to="/absences" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
               Voir tout l'historique <ArrowRight className="w-3 h-3" />
             </Link>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left text-xs">
               <thead>
                 <tr className="text-[10px] text-slate-500 font-bold uppercase border-b border-slate-100">
                   <th className="pb-3 font-bold">COLLABORATEUR</th>
                   <th className="pb-3 font-bold">DÉPARTEMENT</th>
                   <th className="pb-3 font-bold">ÉVÉNEMENT</th>
                   <th className="pb-3 font-bold">MOTIF DÉCLARÉ</th>
                   <th className="pb-3 font-bold">STATUT</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {stats?.recentIncidents && stats.recentIncidents.length > 0 ? (
                   stats.recentIncidents.map((inc, i) => {
                     const emp = inc.employee;
                     const initials = emp ? `${emp.prenom?.[0] || ""}${emp.nom?.[0] || ""}`.toUpperCase() : "??";
                     return (
                       <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                         <td className="py-3">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                               {initials}
                             </div>
                             <div>
                               <p className="font-bold text-slate-900">
                                 {emp ? `${emp.prenom} ${emp.nom}` : "Inconnu"}
                               </p>
                               <p className="text-[10px] text-slate-400">
                                 {emp?.matricule || "N/A"}
                               </p>
                             </div>
                           </div>
                         </td>
                         <td className="py-3 text-slate-600">
                           {emp?.departement || "Non défini"}
                         </td>
                         <td className="py-3">
                           {inc.type === "Retard" ? (
                             <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                               <CalendarX className="w-4 h-4 text-amber-500" />
                               <span>Retard (+{inc.retardMinutes || 0} min)</span>
                             </div>
                           ) : inc.type === "Départ anticipé" ? (
                             <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                               <ArrowRight className="w-4 h-4 text-blue-500" />
                               <span>Départ ant. ({inc.heureDepart || "—"})</span>
                             </div>
                           ) : inc.type === "Télétravail" ? (
                             <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                               <Laptop className="w-4 h-4 text-emerald-500" />
                               <span>Télétravail</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                               <Bell className="w-4 h-4 text-rose-500" />
                               <span>Absence imprévue</span>
                             </div>
                           )}
                         </td>
                         <td className="py-3 text-slate-600 max-w-[180px] truncate" title={inc.motif}>
                           {inc.motif || <span className="italic text-slate-400">Aucun motif transmis</span>}
                         </td>
                         <td className="py-3">
                           {inc.justifiee ? (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                               <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Justifié
                             </span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                               <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Non régularisé
                             </span>
                           )}
                         </td>
                       </tr>
                     );
                   })
                 ) : (
                   <tr>
                     <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                       Aucun incident ou absence enregistré pour le moment.
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* MOTIFS D'ABSENCE & ACTIONS RAPIDES */}
        <div className="flex flex-col gap-6">
           
           {/* MOTIFS D'ABSENCE DU MOIS */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-slate-900">Motifs d'Absence du Mois</h3>
               <div className="text-right leading-tight">
                  <span className="block text-[10px] font-bold text-slate-800 capitalize">
                    {new Date().toLocaleString("fr-FR", { month: "long" })}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {new Date().getFullYear()}
                  </span>
               </div>
             </div>
             
             <div className="flex items-center justify-between mt-6">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                    {donutItems.map((item, idx) => {
                      const strokeDasharray = `${item.percent} ${100 - item.percent}`;
                      const strokeDashoffset = 100 - cumulativePercent + 25;
                      cumulativePercent += item.percent;
                      return (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="4"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-700"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-extrabold text-slate-900">
                      {stats?.motifsAbsence?.totalDays ?? 0}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Événements</span>
                  </div>
                </div>
                
                <div className="space-y-3 text-xs w-full pl-6">
                  {donutItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-700">{item.name}</span>
                      </span>
                      <span className="font-bold text-slate-900">{item.percent}%</span>
                    </div>
                  ))}
                </div>
             </div>
           </div>

           {/* ACTIONS & RACCOURCIS */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex-1">
             <h3 className="text-base font-bold text-slate-900 mb-4">Actions & Raccourcis RH</h3>
             <div className="space-y-3">
                <Link 
                  to="/leaves" 
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center gap-3 transition-all text-left group"
                >
                   <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                      <CheckSquare className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">Demandes de congés</p>
                      <p className="text-[10px] text-slate-500">
                        {stats?.cards?.pendingLeaves || 0} demande{(stats?.cards?.pendingLeaves || 0) > 1 ? "s" : ""} en attente d'approbation
                      </p>
                   </div>
                   <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <Link 
                  to="/absences" 
                  className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center gap-3 transition-all text-left group"
                >
                   <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
                      <FilePlus className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">Registre des absences & retards</p>
                      <p className="text-[10px] text-slate-500">Bilan absentéisme, retards et justificatifs</p>
                   </div>
                   <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <Link 
                  to="/employees" 
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl flex items-center gap-3 transition-all text-left group"
                >
                   <div className="p-2 bg-white text-blue-600 rounded-lg shadow-sm border border-blue-100 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <p className="text-xs font-bold text-blue-900">Gestion des collaborateurs</p>
                      <p className="text-[10px] text-blue-600/80">
                        {stats?.cards?.totalEmployees || 0} collaborateur{(stats?.cards?.totalEmployees || 0) > 1 ? "s" : ""} dans l'annuaire
                      </p>
                   </div>
                   <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                </Link>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;