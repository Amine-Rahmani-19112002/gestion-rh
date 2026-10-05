import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Download,
  Plus,
  Search,
  Mail,
  ArrowRight,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import api from "../api/axios";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSite, setSelectedSite] = useState("Tous");
  const [sortBy, setSortBy] = useState("effectif-desc");
  const [viewMode, setViewMode] = useState("grid");

  // Modal création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    site: "Manzel Tmim, Nabeul Tunisie",
    managerNom: "",
    managerTitre: "",
    managerEmail: "",
    budgetAlloue: "1.5M€",
    effectif: 30,
    recrutementPostes: 2,
    capaciteJauge: 90,
    santeRH: "Excellente",
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalAlert, setModalAlert] = useState({ open: false, type: "", text: "" });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/departments");
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement départements:", err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const showAlert = (type, text) => {
    setModalAlert({ open: true, type, text });
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/departments", formData);
      showAlert("success", res.data?.message || "Département créé avec succès !");
      setIsModalOpen(false);
      setFormData({
        name: "",
        description: "",
        site: "Manzel Tmim, Nabeul Tunisie",
        managerNom: "",
        managerTitre: "",
        managerEmail: "",
        budgetAlloue: "1.5M€",
        effectif: 30,
        recrutementPostes: 2,
        capaciteJauge: 90,
        santeRH: "Excellente",
      });
      fetchDepartments();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrage & Tri
  const filteredDepartments = useMemo(() => {
    let list = [...departments];

    if (selectedSite !== "Tous") {
      list = list.filter((d) => d.site === selectedSite);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term) ||
          d.managerNom?.toLowerCase().includes(term)
      );
    }

    if (sortBy === "effectif-desc") {
      list.sort((a, b) => (b.effectif || 0) - (a.effectif || 0));
    } else if (sortBy === "effectif-asc") {
      list.sort((a, b) => (a.effectif || 0) - (b.effectif || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [departments, selectedSite, searchTerm, sortBy]);

  // Statistiques globales
  const stats = useMemo(() => {
    const totalPoles = departments.length;
    const totalEffectif = departments.reduce((acc, d) => acc + (d.effectif || 0), 0);
    const totalRecrutement = departments.reduce((acc, d) => acc + (d.recrutementPostes || 0), 0);
    const encadrementRatio = totalPoles > 0 ? (totalEffectif / (totalPoles * 15)).toFixed(1) : "8.4";

    return {
      poles: totalPoles || 8,
      effectif: totalEffectif || 1240,
      encadrement: `1 : ${encadrementRatio}`,
      postesOuverts: totalRecrutement || 34,
    };
  }, [departments]);

  // Liste des sites uniques
  const sites = ["Tous", "Paris HQ", "Lyon Tech", "Manzel Tmim, Nabeul Tunisie", "Remote"];

  return (
    <div className="space-y-6 max-w-[1550px] mx-auto pb-12">
      {/* ALERTE MODALE */}
      {modalAlert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                modalAlert.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              }`}
            >
              {modalAlert.type === "success" ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {modalAlert.type === "success" ? "Succès" : "Erreur"}
            </h3>
            <p className="text-xs text-slate-600">{modalAlert.text}</p>
            <button
              onClick={() => setModalAlert({ open: false, type: "", text: "" })}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700"
            >
              D'accord
            </button>
          </div>
        </div>
      )}

      {/* EN-TÊTE DE SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Structure d'Entreprise
            </span>
            <span className="text-xs text-slate-400">• Mis à jour aujourd'hui à 09:42</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Départements & Pôles</h1>
          <p className="text-xs text-slate-500 font-medium">
            Cartographie de l'organisation, répartition des {stats.effectif} collaborateurs et suivi des budgets de masse salariale par division.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exporter l'organigramme</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau département</span>
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Départements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Départements</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{stats.poles} Pôles</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+1 Pôle créé ce trimestre (IA Lab)</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Effectif Actif Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Effectif Actif Total</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{stats.effectif}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> 96% CDI
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> 4% CDD / Alt.
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Taux d'Encadrement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Taux d'Encadrement</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900">{stats.encadrement}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 font-medium">1 manager pour 8.4 salariés (Norme: 8-10)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Postes Ouverts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Postes Ouverts</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-rose-600">{stats.postesOuverts} Postes</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-[10px] font-bold text-rose-700">
              <span>Priorité Talent Acq. sur 5 pôles clés</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BARRE DE RECHERCHE, SITES & FILTRES */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Recherche */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrer par nom de pôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filtres Site */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Site :</span>
          {sites.map((site) => (
            <button
              key={site}
              onClick={() => setSelectedSite(site)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSite === site
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {site} {site === "Tous" && `(${departments.length})`}
            </button>
          ))}
        </div>

        {/* Tri et Toggle vue */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="effectif-desc">Effectif décroissant</option>
              <option value="effectif-asc">Effectif croissant</option>
              <option value="name">Nom alphabétique</option>
            </select>
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* GRILLE DES DÉPARTEMENTS */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-semibold bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-pulse text-xs">
          Chargement de l'organigramme des départements...
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">Aucun pôle ne correspond à votre recherche</p>
          <p className="text-xs text-slate-400 mt-1">Essayez de modifier vos filtres ou créez un nouveau département.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => {
            const managerInitials = dept.managerNom
              ? dept.managerNom
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "RH";

            return (
              <div
                key={dept._id}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top card: Icon + Nom + Statut */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 leading-tight">{dept.name}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{dept.description || dept.site}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Actif
                    </span>
                  </div>

                  {/* Manager Box */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center">
                        {managerInitials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {dept.managerNom || (dept.manager ? `${dept.manager.prenom} ${dept.manager.nom}` : "Sophie Maréchal")}
                        </h4>
                        <p className="text-[10px] text-slate-400">{dept.managerTitre || "Directeur de Département"}</p>
                      </div>
                    </div>
                    <a
                      href={`mailto:${dept.managerEmail || "contact@talentpulse.rh"}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                      title="Envoyer un e-mail"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>

                  {/* 3 Metrics: Effectif, Budget, Recrutement */}
                  <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-100 mb-4">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Effectif</span>
                      <span className="text-base font-black text-slate-900">{dept.effectif || 45}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Budget Alloué</span>
                      <span className="text-base font-black text-blue-600">{dept.budgetAlloue || "1.8M€"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Recrutement</span>
                      <span className="text-base font-black text-rose-600">{dept.recrutementPostes || 2} postes</span>
                    </div>
                  </div>

                  {/* Jauge de capacité opérationnelle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-[11px] text-slate-500">Jauge de capacité opérationnelle</span>
                      <span className="text-slate-800">{dept.capaciteJauge || 92}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${dept.capaciteJauge || 92}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Sous-équipes Chips */}
                  {dept.sousEquipes && dept.sousEquipes.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Sous-équipes ({dept.sousEquipes.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {dept.sousEquipes.map((sub, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] font-semibold text-slate-700"
                          >
                            <span>{sub.nom}</span>
                            <span className="text-slate-400 font-bold">({sub.count})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Santé RH + Consulter l'organigramme */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-bold text-slate-600">
                      Santé RH : <strong className="text-slate-800">{dept.santeRH || "Excellente"}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => showAlert("info", `Organigramme détaillé du pôle ${dept.name} : ${dept.effectif} collaborateurs enregistrés.`)}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Consulter l'organigramme</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BANNIÈRE DE SIMULATION ORGANIGRAMME (BOTTOM CTA) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Besoin de restructurer un pôle ou de fusionner des sous-équipes ?
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Le simulateur d'organigramme vous permet de tester des scénarios d'attribution de budgets et de transferts de salariés avant validation RH.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => showAlert("info", "Historique des 3 dernières simulations archivées.")}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            Consulter l'historique
          </button>
          <button
            onClick={() => showAlert("success", "Lancement du module de simulation interactif...")}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            Lancer une simulation RH
          </button>
        </div>
      </div>

      {/* MODAL CRÉATION DE DÉPARTEMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Créer un Nouveau Département</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom du pôle *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Data & Intelligence Artificielle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site géographique</label>
                  <select
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="Manzel Tmim, Nabeul Tunisie">Manzel Tmim, Nabeul Tunisie</option>
                    <option value="Paris HQ">Paris HQ</option>
                    <option value="Lyon Tech">Lyon Tech</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sous-titre / Spécialité</label>
                <input
                  type="text"
                  placeholder="ex: Tech Hub Paris & Lyon"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager Responsable</label>
                  <input
                    type="text"
                    placeholder="ex: Alexandre Duval"
                    value={formData.managerNom}
                    onChange={(e) => setFormData({ ...formData, managerNom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Titre du Manager</label>
                  <input
                    type="text"
                    placeholder="ex: Head of Data & AI"
                    value={formData.managerTitre}
                    onChange={(e) => setFormData({ ...formData, managerTitre: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget Alloué</label>
                  <input
                    type="text"
                    placeholder="2.5M€"
                    value={formData.budgetAlloue}
                    onChange={(e) => setFormData({ ...formData, budgetAlloue: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Effectif prévu</label>
                  <input
                    type="number"
                    value={formData.effectif}
                    onChange={(e) => setFormData({ ...formData, effectif: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postes ouverts</label>
                  <input
                    type="number"
                    value={formData.recrutementPostes}
                    onChange={(e) => setFormData({ ...formData, recrutementPostes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  {submitting ? "Création..." : "Enregistrer le pôle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
