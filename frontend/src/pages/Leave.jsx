import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Check,
  X,
  Edit3,
  Trash2,
  CalendarDays,
  Palmtree,
  Stethoscope,
  Briefcase,
  Baby,
  HeartHandshake,
  TrendingDown,
  Sparkles,
  Info,
  ChevronRight,
} from "lucide-react";
import api from "../api/axios";

const TYPE_CONGE_CONFIG = {
  "Congé annuel": { icon: Palmtree, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  "Congé maladie": { icon: Stethoscope, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
  "Congé sans solde": { icon: TrendingDown, color: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200" },
  "Congé maternité": { icon: Baby, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  "Congé paternité": { icon: HeartHandshake, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  Autre: { icon: CalendarDays, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
};

export default function Leave() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = storedUser?.role === "admin";

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // all, attente, approuve, refuse
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    employee: "",
    typeConge: "Congé annuel",
    dateDebut: "",
    dateFin: "",
    motif: "",
  });

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [commentaireAdmin, setCommentaireAdmin] = useState("");
  const [modalAlert, setModalAlert] = useState({ open: false, type: "", text: "" });

  const showAlert = (type, text) => {
    setModalAlert({ open: true, type, text });
  };

  const closeAlert = () => {
    setModalAlert({ open: false, type, text });
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/leaves");
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement congés:", err);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (isAdmin) {
      try {
        const { data } = await api.get("/employees");
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement employés:", err);
      }
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calcul dynamique des jours demandés
  const calculatedDays = useMemo(() => {
    if (!formData.dateDebut || !formData.dateFin) return 0;
    const start = new Date(formData.dateDebut);
    const end = new Date(formData.dateFin);
    if (end < start) return 0;
    return Math.floor((end - start) / 86400000) + 1;
  }, [formData.dateDebut, formData.dateFin]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { data } = await api.put(`/leaves/${editingId}`, formData);
        showAlert("success", data.message || "Demande modifiée avec succès.");
        setEditingId(null);
      } else {
        const { data } = await api.post("/leaves", formData);
        showAlert("success", data.message || "Demande créée avec succès.");
      }

      setFormData({
        employee: "",
        typeConge: "Congé annuel",
        dateDebut: "",
        dateFin: "",
        motif: "",
      });
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleEditClick = (leave) => {
    setEditingId(leave._id);
    const formattedDebut = leave.dateDebut ? new Date(leave.dateDebut).toISOString().split("T")[0] : "";
    const formattedFin = leave.dateFin ? new Date(leave.dateFin).toISOString().split("T")[0] : "";

    setFormData({
      employee: leave.employee?._id || leave.employee || "",
      typeConge: leave.typeConge || "Congé annuel",
      dateDebut: formattedDebut,
      dateFin: formattedFin,
      motif: leave.motif || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      employee: "",
      typeConge: "Congé annuel",
      dateDebut: "",
      dateFin: "",
      motif: "",
    });
  };

  const handleReviewAction = async () => {
    if (!selectedLeave || !actionType) return;

    try {
      const endpoint = `/leaves/${selectedLeave._id}/${actionType}`;
      const { data } = await api.put(endpoint, { commentaireAdmin });
      showAlert("success", data.message || "Action enregistrée avec succès.");
      setSelectedLeave(null);
      setActionType(null);
      setCommentaireAdmin("");
      fetchLeaves();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors du traitement.");
    }
  };

  const handleCancel = async (leaveId) => {
    if (window.confirm("Voulez-vous vraiment annuler cette demande ?")) {
      try {
        const { data } = await api.delete(`/leaves/${leaveId}`);
        showAlert("success", data.message || "Demande annulée.");
        fetchLeaves();
      } catch (err) {
        showAlert("danger", err.response?.data?.message || "Erreur lors de l'annulation.");
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
  };

  // Filtrage selon l'onglet
  const filteredLeaves = useMemo(() => {
    if (activeTab === "attente") return leaves.filter((l) => l.statut === "En attente");
    if (activeTab === "approuve") return leaves.filter((l) => l.statut === "Approuvé");
    if (activeTab === "refuse") return leaves.filter((l) => l.statut === "Refusé" || l.statut === "Annulé");
    return leaves;
  }, [leaves, activeTab]);

  // Statistiques de congés
  const stats = useMemo(() => {
    const totalDemandes = leaves.length;
    const enAttente = leaves.filter((l) => l.statut === "En attente").length;
    const approuvees = leaves.filter((l) => l.statut === "Approuvé");
    const joursPris = approuvees.reduce((acc, curr) => acc + (curr.nombreJours || 0), 0);

    return {
      soldeCP: 25,
      soldeRTT: 8,
      joursPris,
      enAttente,
      total: totalDemandes,
    };
  }, [leaves]);

  const renderBadge = (statut) => {
    switch (statut) {
      case "Approuvé":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approuvé
          </span>
        );
      case "Refusé":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Refusé
          </span>
        );
      case "Annulé":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5" /> Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> En attente RH
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
              {modalAlert.type === "success" ? "Succès" : "Information"}
            </h3>
            <p className="text-xs text-slate-600 font-medium">{modalAlert.text}</p>
            <button
              onClick={closeAlert}
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
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Gestion des Congés • Période 2024
            </span>
            <span className="text-xs text-slate-400">• Synchronisation solde RH active</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Demandes de Congé & Absences</h1>
          <p className="text-xs text-slate-500 font-medium">
            Posez vos congés payés et RTT, suivez vos soldes disponibles et consultez l'avancement des approbations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? "Masquer le formulaire" : "Nouvelle demande de congé"}</span>
          </button>
        </div>
      </div>

      {/* 4 STAT CARDS DE SOLDES & CONGÉS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde CP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Solde Congés Payés</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-black text-slate-900">{stats.soldeCP}</span>
              <span className="text-xs font-bold text-slate-400">/ 30 jours</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "83%" }}></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">5 jours posés cette année</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Palmtree className="w-5 h-5" />
          </div>
        </div>

        {/* Solde RTT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Solde RTT Annuel</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-black text-slate-900">{stats.soldeRTT}</span>
              <span className="text-xs font-bold text-slate-400">/ 10 jours</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "80%" }}></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">2 jours RTT posés</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Congés pris */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Jours Posés</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-black text-blue-600">{stats.joursPris}</span>
              <span className="text-xs font-bold text-slate-400">jours validés</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 font-medium">Décomptés du planning RH 2024</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Demandes en attente */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Demandes en Arbitrage</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-black text-amber-600">{stats.enAttente}</span>
              <span className="text-xs font-bold text-slate-400">en cours</span>
            </div>
            <p className="mt-2 text-[11px] text-amber-600 font-semibold">
              {stats.enAttente > 0 ? "Validation manager attendue" : "Aucun dossier en attente"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FORMULAIRE DE CRÉATION / MODIFICATION (RÉDUCTIBLE) */}
      {(showForm || editingId) && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <h2 className="text-sm font-black text-slate-900">
                {editingId ? "Modifier la Demande de Congé" : "Nouvelle Demande de Congé"}
              </h2>
            </div>
            <button onClick={cancelEditing} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
              Annuler
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isAdmin && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Attribuer à l'Employé <span className="text-rose-500">*</span>
                </label>
                <select
                  name="employee"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  value={formData.employee}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choisir un employé --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.matricule} - {emp.nom} {emp.prenom} ({emp.poste})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Type de Congé</label>
                <select
                  name="typeConge"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  value={formData.typeConge}
                  onChange={handleChange}
                >
                  <option value="Congé annuel">Congé Payé / Annuel</option>
                  <option value="Congé maladie">Congé Maladie</option>
                  <option value="Congé sans solde">Sans Solde</option>
                  <option value="Congé maternité">Maternité</option>
                  <option value="Congé paternité">Paternité</option>
                  <option value="Autre">Autre absence justifiée</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date de Début <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  value={formData.dateDebut}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date de Fin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateFin"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  value={formData.dateFin}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Aperçu du décompte */}
            {calculatedDays > 0 && (
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
                <span className="text-xs text-blue-800 font-semibold">
                  Durée totale de la demande :
                </span>
                <span className="text-sm font-black text-blue-700">
                  {calculatedDays} jour{calculatedDays > 1 ? "s" : ""} ouvré{calculatedDays > 1 ? "s" : ""}
                </span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motif ou Précision <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="motif"
                rows="2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                placeholder="Indiquez les détails de votre demande pour votre manager..."
                value={formData.motif}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20"
              >
                {editingId ? "Mettre à jour la demande" : "Soumettre la demande"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HISTORIQUE DES DEMANDES AVEC ONGLETS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Onglets de filtrage */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Toutes les demandes ({leaves.length})
            </button>
            <button
              onClick={() => setActiveTab("attente")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "attente" ? "bg-amber-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              En attente ({stats.enAttente})
            </button>
            <button
              onClick={() => setActiveTab("approuve")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "approuve" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Approuvées
            </button>
            <button
              onClick={() => setActiveTab("refuse")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "refuse" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Refusées / Annulées
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-5">Employé</th>
                <th className="py-3 px-5">Type de Congé</th>
                <th className="py-3 px-5">Période Demandée</th>
                <th className="py-3 px-5">Durée</th>
                <th className="py-3 px-5">Statut RH</th>
                <th className="py-3 px-5">Motif & Remarque</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold animate-pulse">
                    Chargement de vos demandes de congé...
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    Aucune demande de congé dans cette vue.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const emp = leave.employee || {};
                  const typeCfg = TYPE_CONGE_CONFIG[leave.typeConge] || TYPE_CONGE_CONFIG["Autre"];
                  const TypeIcon = typeCfg.icon;

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 leading-tight">
                          {emp.nom ? `${emp.prenom} ${emp.nom}` : "Moi-même"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {emp.matricule || "Collaborateur"} • {emp.poste || ""}
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${typeCfg.bg} ${typeCfg.color} border ${typeCfg.border}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          <span>{leave.typeConge}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(leave.dateDebut)}</span>
                          <span className="text-slate-400">→</span>
                          <span>{formatDate(leave.dateFin)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-black text-slate-900">
                        {leave.nombreJours ?? 1} jour{leave.nombreJours > 1 ? "s" : ""}
                      </td>

                      <td className="py-3.5 px-5">{renderBadge(leave.statut)}</td>

                      <td className="py-3.5 px-5 max-w-xs">
                        <p className="truncate text-slate-700 font-medium">{leave.motif}</p>
                        {leave.commentaireAdmin && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            RH : {leave.commentaireAdmin}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAdmin && leave.statut === "En attente" && (
                            <>
                              <button
                                title="Approuver la demande"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setActionType("approve");
                                }}
                                className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                title="Refuser la demande"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setActionType("reject");
                                }}
                                className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {leave.statut === "En attente" && (
                            <>
                              <button
                                title="Modifier ma demande"
                                onClick={() => handleEditClick(leave)}
                                className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                title="Annuler ma demande"
                                onClick={() => handleCancel(leave._id)}
                                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE DÉCISION ADMIN */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {actionType === "approve" ? "Valider la demande de congé" : "Refuser la demande"}
              </h3>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <p>
                <strong className="text-slate-800">Collaborateur :</strong> {selectedLeave.employee?.nom}{" "}
                {selectedLeave.employee?.prenom}
              </p>
              <p>
                <strong className="text-slate-800">Période :</strong> du {formatDate(selectedLeave.dateDebut)} au{" "}
                {formatDate(selectedLeave.dateFin)} ({selectedLeave.nombreJours} jours)
              </p>
              <p>
                <strong className="text-slate-800">Motif :</strong> {selectedLeave.motif}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarque ou motif de décision
              </label>
              <textarea
                rows="3"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                value={commentaireAdmin}
                onChange={(e) => setCommentaireAdmin(e.target.value)}
                placeholder="Indiquez une précision pour le collaborateur..."
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                onClick={() => setSelectedLeave(null)}
              >
                Fermer
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-bold text-xs rounded-xl text-white shadow-sm transition-all ${
                  actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
                onClick={handleReviewAction}
              >
                Confirmer {actionType === "approve" ? "l'approbation" : "le refus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}