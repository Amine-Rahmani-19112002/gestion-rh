import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Smile,
  Target,
  GraduationCap,
  Download,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  BarChart3,
  Layers,
  FileText,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campagnes");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [selectedDept, setSelectedDept] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    collaborateurNom: "",
    collaborateurPoste: "",
    collaborateurPôle: "Tech",
    managerEvaluateur: "",
    managerPoste: "Directeur de Département",
    dateProgrammee: "15 Déc 2024",
    lieuOuLien: "Salle Orion / Distanciel",
    statutEtape: "Planifié",
    talentBoxCategory: "Futurs Leaders",
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalAlert, setModalAlert] = useState({ open: false, type: "", text: "" });

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/evaluations");
      setEvaluations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur chargement évaluations:", err);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const showAlert = (type, text) => {
    setModalAlert({ open: true, type, text });
  };

  const handleCreateEvaluation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/evaluations", formData);
      showAlert("success", res.data?.message || "Campagne d'évaluation enregistrée !");
      setIsModalOpen(false);
      setFormData({
        collaborateurNom: "",
        collaborateurPoste: "",
        collaborateurPôle: "Tech",
        managerEvaluateur: "",
        managerPoste: "Directeur de Département",
        dateProgrammee: "15 Déc 2024",
        lieuOuLien: "Salle Orion / Distanciel",
        statutEtape: "Planifié",
        talentBoxCategory: "Futurs Leaders",
      });
      fetchEvaluations();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrage
  const filteredEvaluations = useMemo(() => {
    let list = [...evaluations];

    if (selectedStatut !== "Tous") {
      list = list.filter((item) => item.statutEtape === selectedStatut);
    }

    if (selectedDept !== "Tous") {
      list = list.filter((item) => item.collaborateurPôle === selectedDept);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (item) =>
          item.collaborateurNom?.toLowerCase().includes(term) ||
          item.collaborateurPoste?.toLowerCase().includes(term) ||
          item.managerEvaluateur?.toLowerCase().includes(term)
      );
    }

    return list;
  }, [evaluations, selectedStatut, selectedDept, searchTerm]);

  // Statut badges
  const renderStatutBadge = (statut) => {
    switch (statut) {
      case "Terminé & Signé":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Terminé & Signé
          </span>
        );
      case "Attente signature":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Attente signature
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {statut || "Planifié"}
          </span>
        );
    }
  };

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
              Cycle RH 2024 / Q4 • Campagne active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Évaluations & Performance</h1>
          <p className="text-xs text-slate-500 font-medium">
            Campagnes d'entretiens annuels, entretiens professionnels obligatoires et suivi des objectifs OKR d'Acme Corp Europe.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showAlert("info", "Ouverture de l'historique complet des revues 2021-2023...")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Historique des revues</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Lancer une campagne d'évaluation</span>
          </button>
        </div>
      </div>

      {/* BANNIÈRE CAMPAGNE ANNUELLE (IMAGE 4) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-base font-black text-slate-900">
                  Campagne Annuelle 2024 - Bilan & Perspectives
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  Clôture le 15 Décembre
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Périmètre global : 1 240 collaborateurs éligibles • Entretien annuel d'évaluation & Entretien professionnel couplés
              </p>
            </div>
          </div>

          {/* Jauge globale 78% */}
          <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200/70 shrink-0">
            <div className="text-right">
              <span className="block text-2xl font-black text-blue-600 leading-none">78%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Avancement Global</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Barre de répartition tricolore */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Progression des 1 240 dossiers d'évaluation</span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <strong>967 finalisés (78%)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <strong>182 planifiés (15%)</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <strong>91 validation RH (7%)</strong>
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: "78%" }}></div>
            <div className="bg-blue-500 h-full" style={{ width: "15%" }}></div>
            <div className="bg-indigo-500 h-full" style={{ width: "7%" }}></div>
          </div>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Satisfaction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">4.4</span>
              <span className="text-xs text-slate-400 font-bold">/ 5</span>
            </div>
            <span className="text-xs font-semibold text-slate-700 block">Satisfaction collaborateurs</span>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 block">↑ +0.3 vs 2023</span>
          </div>
        </div>

        {/* Objectifs annuels */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">86%</span>
            <span className="text-xs font-semibold text-slate-700 block">Objectifs annuels atteints</span>
            <span className="text-[11px] font-bold text-indigo-600 mt-1 block">↗ +4.2% d'alignement OKR</span>
          </div>
        </div>

        {/* Compétences clés */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">91%</span>
            <span className="text-xs font-semibold text-slate-700 block">Compétences clés validées</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Cartographie à 94% complète</span>
          </div>
        </div>

        {/* Plans de formation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">312</span>
            <span className="text-xs font-semibold text-slate-700 block">Plans formation sollicités</span>
            <span className="text-[11px] font-bold text-purple-600 mt-1 block">Prêts pour arbitrage 2025</span>
          </div>
        </div>
      </div>

      {/* ONGLET BARRE NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("campagnes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "campagnes"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Campagnes actives</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-black">1</span>
          </button>

          <button
            onClick={() => setActiveTab("entretiens")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "entretiens"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Entretiens individuels</span>
          </button>

          <button
            onClick={() => setActiveTab("matrice")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "matrice"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Matrice de compétences (9-Box Grid)</span>
          </button>

          <button
            onClick={() => setActiveTab("okr")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "okr"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Objectifs & OKRs</span>
          </button>
        </div>

        <button
          onClick={() => showAlert("success", "Export du rapport consolidé RH Q4 en cours de génération...")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Exporter rapport RH</span>
        </button>
      </div>

      {/* CONTENU PRINCIPAL SPLIT EN 2 COLONNES (GAUCHE TABLEAU / DROITE 9-BOX & FORMATIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE DE GAUCHE : TABLEAU ENTRETIENS (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Entretiens en cours</h3>
              <p className="text-[11px] text-slate-400">Affichage de {filteredEvaluations.length} sur 1 240</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Terminé & Signé">Terminé & Signé</option>
                <option value="Planifié">Planifié</option>
                <option value="Attente signature">Attente signature</option>
              </select>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Tous">Tous départements</option>
                <option value="Tech">Tech</option>
                <option value="Mkt">Marketing</option>
                <option value="Ventes">Ventes</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Collaborateur</th>
                  <th className="py-3 px-4">Manager Évaluateur</th>
                  <th className="py-3 px-4">Date Programmée</th>
                  <th className="py-3 px-4">Statut & Étape</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-semibold animate-pulse">
                      Chargement des entretiens...
                    </td>
                  </tr>
                ) : filteredEvaluations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-semibold">
                      Aucun entretien ne correspond à vos critères.
                    </td>
                  </tr>
                ) : (
                  filteredEvaluations.map((item) => {
                    const initials = item.collaborateurNom
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {item.collaborateurNom}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {item.collaborateurPoste} • {item.collaborateurPôle}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block leading-tight">{item.managerEvaluateur}</span>
                          <span className="text-[10px] text-slate-400">{item.managerPoste}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block leading-tight">{item.dateProgrammee}</span>
                          <span className="text-[10px] text-slate-400">{item.lieuOuLien}</span>
                        </td>

                        <td className="py-3.5 px-4">{renderStatutBadge(item.statutEtape)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Affichage de 1 à 5 sur 1 240 salariés</span>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs">1</button>
              <button className="w-7 h-7 rounded-lg hover:bg-slate-100 font-bold text-xs">2</button>
              <button className="w-7 h-7 rounded-lg hover:bg-slate-100 font-bold text-xs">3</button>
              <span className="px-1 text-slate-400">...</span>
              <button className="w-7 h-7 rounded-lg hover:bg-slate-100 font-bold text-xs">248</button>
              <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DE DROITE : MATRICE DES TALENTS (9-BOX) & BESOINS FORMATION (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* MATRICE DES TALENTS 9-BOX */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900">Matrice des Talents</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Répartition croisée Performance × Potentiel basée sur les 967 entretiens d'ores et déjà validés
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                9-Box Q4 2024
              </span>
            </div>

            {/* GRILLE 3x3 9-BOX */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1 px-1">
                <span>POTENTIEL ↑</span>
                <span>PERFORMANCE →</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center">
                {/* LIGNE 1 */}
                <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                  <span className="text-[9px] text-slate-500 font-semibold block">Énigmes</span>
                  <span className="text-sm font-black text-slate-900">42</span>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="text-[9px] text-indigo-700 font-semibold block">Futurs Leaders</span>
                  <span className="text-sm font-black text-indigo-900">118</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <span className="text-[9px] text-blue-100 font-semibold block">Top Performers</span>
                  <span className="text-sm font-black text-white">89</span>
                </div>

                {/* LIGNE 2 */}
                <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-100">
                  <span className="text-[9px] text-slate-500 font-semibold block">Dilemmes</span>
                  <span className="text-sm font-black text-slate-900">64</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[9px] text-slate-600 font-semibold block">Cœurs de métier</span>
                  <span className="text-sm font-black text-slate-900">348</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-100/60 border border-blue-200">
                  <span className="text-[9px] text-blue-800 font-semibold block">Piliers stables</span>
                  <span className="text-sm font-black text-blue-900">214</span>
                </div>

                {/* LIGNE 3 */}
                <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                  <span className="text-[9px] text-rose-600 font-semibold block">À recadrer</span>
                  <span className="text-sm font-black text-rose-700">19</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                  <span className="text-[9px] text-slate-500 font-semibold block">Spécialistes</span>
                  <span className="text-sm font-black text-slate-900">51</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-100/80 border border-slate-200">
                  <span className="text-[9px] text-slate-600 font-semibold block">Experts solides</span>
                  <span className="text-sm font-black text-slate-900">22</span>
                </div>
              </div>

              {/* Badges de synthèse */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Top Performers & Leaders
                  </span>
                  <strong className="text-slate-900">207 coll. (21.4%)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Piliers & Alignés
                  </span>
                  <strong className="text-slate-900">562 coll. (58.1%)</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => showAlert("info", "Ouverture de la vue interactive plein écran de la matrice 9-Box...")}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Explorer la matrice plein écran</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* BESOINS FORMATION 2025 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">Besoins Formation 2025</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Compétences prioritaires les plus demandées lors des synthèses d'entretiens pour arbitrage budgétaire.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Top 3
              </span>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">IA Générative & Automatisation</span>
                  <span className="text-xs font-black text-blue-600">142 demandes</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">Tech, Marketing, Juridique • 45% des souhaits</p>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Leadership Hybride & Résilience</span>
                  <span className="text-xs font-black text-emerald-600">98 demandes</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">Managers d'équipes & Nouveaux encadrants</p>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: "65%" }}></div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Architecture Cloud & Sécurité SecOps</span>
                  <span className="text-xs font-black text-indigo-600">72 demandes</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">Pôle Ingénierie logicielle & DevOps</p>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
            </div>

            <button
              onClick={() => showAlert("success", "Génération du plan prévisionnel de développement des compétences 2025...")}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Préparer le plan de développement 2025</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL PLANIFIER ÉVALUATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Planifier un Entretien d'Évaluation</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom du Collaborateur *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Julien Morel"
                    value={formData.collaborateurNom}
                    onChange={(e) => setFormData({ ...formData, collaborateurNom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Poste & Pôle</label>
                  <input
                    type="text"
                    placeholder="ex: Lead Dev Backend • Tech"
                    value={formData.collaborateurPoste}
                    onChange={(e) => setFormData({ ...formData, collaborateurPoste: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager Évaluateur</label>
                  <input
                    type="text"
                    placeholder="ex: Alexandre Mercier"
                    value={formData.managerEvaluateur}
                    onChange={(e) => setFormData({ ...formData, managerEvaluateur: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date & Lieu / Lien</label>
                  <input
                    type="text"
                    placeholder="ex: 15 Déc 2024 - 14h00"
                    value={formData.dateProgrammee}
                    onChange={(e) => setFormData({ ...formData, dateProgrammee: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut initial</label>
                  <select
                    value={formData.statutEtape}
                    onChange={(e) => setFormData({ ...formData, statutEtape: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Planifié">Planifié</option>
                    <option value="Attente signature">Attente signature</option>
                    <option value="Terminé & Signé">Terminé & Signé</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie 9-Box</label>
                  <select
                    value={formData.talentBoxCategory}
                    onChange={(e) => setFormData({ ...formData, talentBoxCategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Futurs Leaders">Futurs Leaders</option>
                    <option value="Top Performers">Top Performers</option>
                    <option value="Cœurs de métier">Cœurs de métier</option>
                    <option value="Piliers stables">Piliers stables</option>
                    <option value="Énigmes">Énigmes</option>
                    <option value="Experts solides">Experts solides</option>
                  </select>
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
                  {submitting ? "Planification..." : "Planifier l'entretien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
