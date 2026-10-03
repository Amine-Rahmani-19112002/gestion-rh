import { useEffect, useState, useMemo } from "react";
import {
  Search, Calendar, Clock, AlertCircle, AlertTriangle, CheckCircle2,
  XCircle, Plus, FileText, Paperclip, CheckSquare, Trash2, Edit3,
  X, ChevronDown, ChevronRight, User, Building, ArrowRight, Download,
  Check, RefreshCw, Send, ShieldCheck, CornerDownRight, Laptop,
  ArrowLeftFromLine, AlarmClock, SlidersHorizontal, Info, Eye
} from "lucide-react";
import api from "../api/axios";

// Configuration visuelle par type d'absence
const TYPE_CONFIG = {
  "Absence": {
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: XCircle,
    label: "Absence",
  },
  "Retard": {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlarmClock,
    label: "Retard",
  },
  "Départ anticipé": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: ArrowLeftFromLine,
    label: "Départ anticipé",
  },
  "Télétravail": {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: Laptop,
    label: "Télétravail",
  },
};

const INITIAL_FORM = {
  employee: "",
  date: new Date().toISOString().split("T")[0],
  type: "Absence",
  motif: "",
  justifiee: false,
  heureArrivee: "09:30",
  heureDepart: "18:00",
  retardMinutes: 0,
  commentaire: "",
};

export default function Absences() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = storedUser?.role === "admin";

  // Données
  const [absences, setAbsences] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Élément sélectionné pour le panneau de détail & arbitrage
  const [selectedId, setSelectedId] = useState(null);

  // Filtres & Onglets
  const [activeTab, setActiveTab] = useState("all"); // all, retards, maladie, telework, history
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("all"); // all, urgent, standard
  const [sortBy, setSortBy] = useState("recent"); // recent, urgent, longestDelay

  // Décision RH & Arbitrage sur l'absence sélectionnée
  const [regulationMode, setRegulationMode] = useState("tolerance"); // tolerance, recuperation, retenue
  const [rhNote, setRhNote] = useState("");
  const [notifyManager, setNotifyManager] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal Création / Déclaration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState("");

  // Modal Confirmation Suppression
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Notification Modal
  const [modalAlert, setModalAlert] = useState({ open: false, type: "", text: "" });

  const showAlert = (type, text) => setModalAlert({ open: true, type, text });
  const closeAlert = () => setModalAlert({ open: false, type: "", text: "" });

  // Date actuelle dynamique
  const todayFormatted = useMemo(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  // Formatage d'une date en chaîne lisible
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR");
  };

  const formatDateLong = (dateStr) => {
    if (!dateStr) return todayFormatted;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return todayFormatted;
    const formatted = d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Chargement des absences
  const fetchAbsences = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/absences");
      const list = Array.isArray(data) ? data : [];
      setAbsences(list);
      // Sélectionner automatiquement le premier si rien n'est sélectionné
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
      }
    } catch (err) {
      console.error("Erreur chargement absences:", err);
      setAbsences([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des employés
  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get("/employees");
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement employés:", err);
    }
  };

  useEffect(() => {
    fetchAbsences();
    fetchEmployees();
  }, []);

  // Absence actuellement sélectionnée
  const selectedAbsence = useMemo(() => {
    if (!selectedId && absences.length > 0) return absences[0];
    return absences.find((a) => a._id === selectedId) || null;
  }, [absences, selectedId]);

  // Synchroniser la note RH lors du changement d'absence sélectionnée
  useEffect(() => {
    if (selectedAbsence) {
      setRhNote(selectedAbsence.commentaire || "");
      if (selectedAbsence.type === "Retard") {
        setRegulationMode("tolerance");
      } else {
        setRegulationMode("recuperation");
      }
    }
  }, [selectedAbsence?._id]);

  // Filtrage selon l'onglet actif et la recherche
  const filteredAbsences = useMemo(() => {
    let list = [...absences];

    // Onglet
    if (activeTab === "retards") {
      list = list.filter((a) => a.type === "Retard");
    } else if (activeTab === "maladie") {
      list = list.filter((a) => a.type === "Absence");
    } else if (activeTab === "telework") {
      list = list.filter((a) => a.type === "Télétravail" || a.type === "Départ anticipé");
    } else if (activeTab === "history") {
      list = list.filter((a) => a.justifiee === true);
    }

    // Filtre urgence
    if (filterUrgency === "urgent") {
      list = list.filter((a) => !a.justifiee || a.retardMinutes >= 30);
    } else if (filterUrgency === "standard") {
      list = list.filter((a) => a.justifiee || a.retardMinutes < 30);
    }

    // Recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((a) => {
        const emp = a.employee || {};
        const fullName = `${emp.nom || ""} ${emp.prenom || ""}`.toLowerCase();
        const matricule = (emp.matricule || "").toLowerCase();
        const poste = (emp.poste || "").toLowerCase();
        const motif = (a.motif || "").toLowerCase();
        return (
          fullName.includes(term) ||
          matricule.includes(term) ||
          poste.includes(term) ||
          motif.includes(term)
        );
      });
    }

    // Tri
    if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    } else if (sortBy === "urgent") {
      list.sort((a, b) => {
        const aUrgent = !a.justifiee || a.retardMinutes >= 30 ? 1 : 0;
        const bUrgent = !b.justifiee || b.retardMinutes >= 30 ? 1 : 0;
        return bUrgent - aUrgent;
      });
    } else if (sortBy === "longestDelay") {
      list.sort((a, b) => (b.retardMinutes || 0) - (a.retardMinutes || 0));
    }

    return list;
  }, [absences, activeTab, filterUrgency, searchTerm, sortBy]);

  // Statistiques pour le haut de page
  const stats = useMemo(() => {
    const total = absences.length;
    const traites = absences.filter((a) => a.justifiee).length;
    const retardsCount = absences.filter((a) => a.type === "Retard").length;
    const maladiesCount = absences.filter((a) => a.type === "Absence").length;
    const teleworkCount = absences.filter((a) => a.type === "Télétravail" || a.type === "Départ anticipé").length;
    const urgents = absences.filter((a) => !a.justifiee && (a.type === "Absence" || a.retardMinutes >= 30)).length;
    const percent = total > 0 ? Math.round((traites / total) * 100) : 0;

    return { total, traites, retardsCount, maladiesCount, teleworkCount, urgents, percent };
  }, [absences]);

  // Statistiques spécifiques à l'employé sélectionné
  const employeeStats = useMemo(() => {
    if (!selectedAbsence?.employee?._id) return { retardsCount: 0, delayMinutes: "0 min" };
    const empId = selectedAbsence.employee._id;
    const empAbsences = absences.filter(
      (a) => (a.employee?._id || a.employee) === empId && a.type === "Retard"
    );
    const count = empAbsences.length;
    const totalMinutes = empAbsences.reduce((acc, curr) => acc + (curr.retardMinutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedTime = hours > 0 ? `${hours}h${minutes > 0 ? minutes : ""}` : `${minutes} min`;

    return { retardsCount: count, delayMinutes: formattedTime };
  }, [absences, selectedAbsence]);

  // Action Arbitrage RH : Valider & Régulariser
  const handleValidateRegularize = async () => {
    if (!selectedAbsence) return;
    setActionLoading(true);
    try {
      const modeLabel =
        regulationMode === "tolerance"
          ? "Tolérance exceptionnelle"
          : regulationMode === "recuperation"
          ? "Récupération d'heures"
          : "Retenue sur salaire";

      const updatedCommentaire = rhNote
        ? `[Décision RH: ${modeLabel}] ${rhNote}`
        : `[Décision RH: ${modeLabel}] Régularisé par RH`;

      const { data } = await api.put(`/absences/${selectedAbsence._id}`, {
        justifiee: true,
        commentaire: updatedCommentaire,
      });

      showAlert("success", data.message || "Dossier validé et régularisé avec succès.");
      fetchAbsences();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors de la régularisation.");
    } finally {
      setActionLoading(false);
    }
  };

  // Action Arbitrage RH : Rejeter / Marquer Non justifiée
  const handleReject = async () => {
    if (!selectedAbsence) return;
    setActionLoading(true);
    try {
      const updatedCommentaire = rhNote
        ? `[Refus RH] ${rhNote}`
        : "[Refus RH] Absence non justifiée.";

      const { data } = await api.put(`/absences/${selectedAbsence._id}`, {
        justifiee: false,
        commentaire: updatedCommentaire,
      });

      showAlert("success", data.message || "Dossier marqué comme non justifié.");
      fetchAbsences();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors du traitement.");
    } finally {
      setActionLoading(false);
    }
  };

  // Suppression d'une absence
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { data } = await api.delete(`/absences/${deleteTarget}`);
      showAlert("success", data.message || "Absence supprimée avec succès.");
      setDeleteTarget(null);
      if (selectedId === deleteTarget) {
        setSelectedId(null);
      }
      fetchAbsences();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors de la suppression.");
      setDeleteTarget(null);
    }
  };

  // Gestion du formulaire de création / édition
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      date: new Date().toISOString().split("T")[0],
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        const { data } = await api.put(`/absences/${editingId}`, formData);
        showAlert("success", data.message || "Absence modifiée avec succès.");
      } else {
        const { data } = await api.post("/absences", formData);
        showAlert("success", data.message || "Absence enregistrée avec succès.");
        if (data?.absence?._id) {
          setSelectedId(data.absence._id);
        }
      }
      setIsModalOpen(false);
      fetchAbsences();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* ALERTE MODALE */}
      {modalAlert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                modalAlert.type === "success"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {modalAlert.type === "success" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {modalAlert.type === "success" ? "Opération réussie" : "Erreur"}
            </h3>
            <p className="text-xs text-slate-600 font-medium">{modalAlert.text}</p>
            <button
              onClick={closeAlert}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-sm ${
                modalAlert.type === "success"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUPPRESSION MODALE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Supprimer la demande</h3>
                <p className="text-xs text-slate-500">Cette action est définitive et opposable.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. EN-TÊTE WORKFLOW RH / ESPACE PERSONNEL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isAdmin ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-blue-600" : "bg-emerald-600"} animate-pulse`}></span>
              {isAdmin ? "Workflow Approbation RH" : "Mon Espace Présence"}
            </span>
            <span className="text-xs text-slate-400">• Synchronisé en temps réel</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAdmin ? "Demandes & Déclarations d'absence / retard" : "Mes Retards & Absences"}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isAdmin 
              ? "Traitement des alertes, déclarations et régularisations en attente de validation RH."
              : "Consultez l'historique et l'état de vos déclarations et justificatifs de présence."}
          </p>
        </div>

        {/* Date dynamique & KPI badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Date Dynamique */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{todayFormatted}</span>
          </div>

          {/* Dossiers traités */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Dossiers traités</span>
              <span className="text-xs font-black text-slate-900">
                {stats.traites} / {stats.total}{" "}
                <span className="text-blue-600 font-bold">({stats.percent}%)</span>
              </span>
            </div>
          </div>

          {/* Alertes urgentes */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl shadow-sm">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-[10px] uppercase font-bold text-rose-600">À traiter</span>
              <span className="text-xs font-black text-rose-700">
                {stats.urgents} {stats.urgents > 1 ? "alertes" : "alerte"}
              </span>
            </div>
          </div>

          {/* Bouton Création / Déclaration */}
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Déclarer un retard / absence</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ONGLETS DE NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Toutes les demandes</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("retards")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "retards"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          }`}
        >
          <AlarmClock className="w-3.5 h-3.5" />
          <span>Retards à valider</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTab === "retards" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
            }`}
          >
            {stats.retardsCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("maladie")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "maladie"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Arrêts maladie & Absences</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTab === "maladie" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
            }`}
          >
            {stats.maladiesCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("telework")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "telework"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Télétravail & Autres</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTab === "telework" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {stats.teleworkCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === "history"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Historique validé</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
              activeTab === "history" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {stats.traites}
          </span>
        </button>
      </div>

      {/* 3. CONTENEUR PRINCIPAL SPLIT (COLONNE GAUCHE: LISTE / COLONNE DROITE: ARBITRAGE & FICHE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLONNE DE GAUCHE : LISTE DES DEMANDES (5 COLS) ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Barre de Recherche et Filtres Rapides */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par nom, équipe, motif..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">Trier:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none"
                >
                  <option value="recent">Plus récent</option>
                  <option value="urgent">Plus urgent</option>
                  <option value="longestDelay">Retard le plus long</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterUrgency("urgent")}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    filterUrgency === "urgent"
                      ? "bg-rose-100 text-rose-700 font-black"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {stats.urgents} Urgents
                </button>
                <button
                  onClick={() => setFilterUrgency("standard")}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                    filterUrgency === "standard"
                      ? "bg-blue-100 text-blue-700 font-black"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {stats.total - stats.urgents} Standards
                </button>
                {filterUrgency !== "all" && (
                  <button
                    onClick={() => setFilterUrgency("all")}
                    className="text-[10px] text-slate-400 underline font-semibold ml-1"
                  >
                    Tous
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Liste des Cartes de Déclarations */}
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-semibold bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-pulse text-xs">
                Chargement des déclarations RH...
              </div>
            ) : filteredAbsences.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Aucune demande trouvée</p>
                <p className="text-[11px] text-slate-400 mt-1">Tous les dossiers de cette section sont traités.</p>
              </div>
            ) : (
              filteredAbsences.map((a) => {
                const emp = a.employee || {};
                const isSelected = a._id === selectedId;
                const isUrgent = !a.justifiee && (a.type === "Absence" || a.retardMinutes >= 30);
                const typeCfg = TYPE_CONFIG[a.type] || TYPE_CONFIG["Absence"];
                const TypeIcon = typeCfg.icon;

                // Initiales de l'employé
                const initials =
                  `${emp.prenom?.[0] || ""}${emp.nom?.[0] || ""}`.toUpperCase() || "RH";

                return (
                  <div
                    key={a._id}
                    onClick={() => setSelectedId(a._id)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-blue-50/40 border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Indicateur gauche sélectionné */}
                    {isSelected && (
                      <span className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-600 rounded-r-full"></span>
                    )}

                    {/* En-tête de la carte */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center shadow-sm">
                            {initials}
                          </div>
                          <span
                            className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white ${
                              a.justifiee ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          ></span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 leading-tight">
                              {emp.prenom} {emp.nom}
                            </h4>
                            {isUrgent ? (
                              <span className="text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded-md">
                                ● Urgent
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                                Standard
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {emp.poste || "Collaborateur"} •{" "}
                            <span className="font-semibold text-slate-600">
                              {emp.departement || "RH"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Date de l'incident */}
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {formatDate(a.date)}
                      </span>
                    </div>

                    {/* Capsule Type & Statut */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/60 mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <TypeIcon className={`w-3.5 h-3.5 ${typeCfg.color}`} />
                        <span>
                          {a.type === "Retard"
                            ? `Retard de ${a.retardMinutes || 15} min`
                            : a.type}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          a.justifiee
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {a.justifiee ? "Régularisé" : "À régulariser"}
                      </span>
                    </div>

                    {/* Motif ou Justificatif joint */}
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <Paperclip className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate italic">
                          {a.motif || "Motif déclaré en attente de précision."}
                        </span>
                      </div>
                      {a.justifiee && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold shrink-0">
                          <Check className="w-3 h-3" /> Vérifié
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pied de liste : compteur */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>
              Affichage de {filteredAbsences.length} sur {absences.length} demandes
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-400 cursor-not-allowed text-[10px] font-bold"
              >
                Précédent
              </button>
              <button
                disabled
                className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-400 cursor-not-allowed text-[10px] font-bold"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLONNE DE DROITE : FICHE DÉTAILLÉE & ZONE D'ARBITRAGE RH (7 COLS) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {selectedAbsence ? (
            <>
              {/* CARTE 1 : FICHE COLLABORATEUR & CONSTAT DE BADGEAGE */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                
                {/* En-tête collaborateur */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                      {`${selectedAbsence.employee?.prenom?.[0] || ""}${
                        selectedAbsence.employee?.nom?.[0] || ""
                      }`.toUpperCase() || "RH"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">
                          {selectedAbsence.employee?.prenom} {selectedAbsence.employee?.nom}
                        </h2>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {selectedAbsence.employee?.typeContrat || "CDI Cadre"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                        <span>
                          Matricule:{" "}
                          <strong className="text-slate-800 font-bold">
                            {selectedAbsence.employee?.matricule || "#EMP-4092"}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>Poste: {selectedAbsence.employee?.poste || "Collaborateur"}</span>
                        <span>•</span>
                        <span>Dép: {selectedAbsence.employee?.departement || "Opérations"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Solde des retards du mois */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-2xl shrink-0">
                    <div className="p-2 bg-white text-blue-600 rounded-xl shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-left leading-tight">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Solde retards (ce mois)
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {employeeStats.retardsCount} retards{" "}
                        <span className="text-blue-600 font-bold">
                          ({employeeStats.delayMinutes} cumulé)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* CONSTAT DU BADGEAGE & HEURES D'ARRIVÉE */}
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>CONSTAT DU BADGEAGE - {formatDateLong(selectedAbsence.date).toUpperCase()}</span>
                    </div>
                    {selectedAbsence.retardMinutes > 0 ? (
                      <span className="text-xs font-black text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        +{selectedAbsence.retardMinutes} minutes d'écart
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                        Non pointé / Absence
                      </span>
                    )}
                  </div>

                  {/* 3 Blocs de mesure */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/60">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        Heure habituelle / prévue
                      </span>
                      <span className="text-base font-black text-slate-800">09:00</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Plage fixe contractuelle</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/60">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        Badgeage effectif
                      </span>
                      <span className="text-base font-black text-blue-600">
                        {selectedAbsence.heureArrivee ||
                          (selectedAbsence.type === "Retard"
                            ? `09:${selectedAbsence.retardMinutes > 9 ? selectedAbsence.retardMinutes : "0" + selectedAbsence.retardMinutes}`
                            : "Non pointé")}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Borne Hall Central RDC</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/60">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        Dépassement horaire
                      </span>
                      <span
                        className={`text-base font-black ${
                          selectedAbsence.retardMinutes > 0 ? "text-rose-600" : "text-slate-800"
                        }`}
                      >
                        {selectedAbsence.retardMinutes > 0
                          ? `${selectedAbsence.retardMinutes} min`
                          : selectedAbsence.type}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {selectedAbsence.justifiee ? "Motif justifié" : "Non régularisé"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DÉCLARATION DU COLLABORATEUR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Déclaration transmise par {selectedAbsence.employee?.prenom}{" "}
                      {selectedAbsence.employee?.nom}
                    </span>
                    <span className="text-slate-400 font-medium text-[11px]">
                      {formatDate(selectedAbsence.date)}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 border-l-4 border-blue-500 rounded-r-2xl text-xs text-slate-700 leading-relaxed font-medium">
                    « {selectedAbsence.motif || "Aucun motif textuel n'a été spécifié lors du signalement de l'incident."} »
                  </div>
                </div>

                {/* PIÈCE JUSTIFICATIVE JOINTE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                      Pièce justificative jointe
                    </span>
                    <span className="text-blue-600 font-bold text-[11px] hover:underline cursor-pointer">
                      Télécharger le justificatif
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-[10px]">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          bulletin_incident_{selectedAbsence._id.slice(-6)}.pdf
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Document transmis • Validité contrôlée RH
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" /> Certifié conforme
                    </span>
                  </div>
                </div>
              </div>

              {isAdmin ? (
                /* CARTE 2 : ZONE DE DÉCISION & ARBITRAGE RH (ADMIN SEULEMENT) */
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <h3 className="text-base font-black text-slate-900">
                        Zone de décision & arbitrage RH
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 italic">
                      Décision opposable au bulletin de paie
                    </span>
                  </div>

                  {/* Mode de régularisation retenu (3 Options Radio Interactives) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2.5">
                      Mode de régularisation retenu :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Option 1 : Tolérance */}
                      <div
                        onClick={() => setRegulationMode("tolerance")}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          regulationMode === "tolerance"
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-slate-900">
                            Tolérance exceptionnelle
                          </span>
                          <input
                            type="radio"
                            name="regMode"
                            checked={regulationMode === "tolerance"}
                            onChange={() => setRegulationMode("tolerance")}
                            className="accent-blue-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Motif transport/santé vérifié sans impact solde
                        </p>
                      </div>

                      {/* Option 2 : Récupération */}
                      <div
                        onClick={() => setRegulationMode("recuperation")}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          regulationMode === "recuperation"
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-slate-900">
                            Récupération d'heures
                          </span>
                          <input
                            type="radio"
                            name="regMode"
                            checked={regulationMode === "recuperation"}
                            onChange={() => setRegulationMode("recuperation")}
                            className="accent-blue-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Report de{" "}
                          {selectedAbsence.retardMinutes ? `${selectedAbsence.retardMinutes} min` : "l'absence"}{" "}
                          en fin de journée
                        </p>
                      </div>

                      {/* Option 3 : Retenue */}
                      <div
                        onClick={() => setRegulationMode("retenue")}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          regulationMode === "retenue"
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-slate-900">
                            Retenue sur salaire
                          </span>
                          <input
                            type="radio"
                            name="regMode"
                            checked={regulationMode === "retenue"}
                            onChange={() => setRegulationMode("retenue")}
                            className="accent-blue-600"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Imputation sur le traitement de paie du mois
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Note interne & Notification */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        Notification au collaborateur & note interne RH :
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyManager}
                          onChange={(e) => setNotifyManager(e.target.checked)}
                          className="rounded accent-blue-600"
                        />
                        <span>Copier le manager direct</span>
                      </label>
                    </div>
                    <textarea
                      rows="2"
                      value={rhNote}
                      onChange={(e) => setRhNote(e.target.value)}
                      placeholder="Ex: Justificatif vérifié. Retard toléré ce jour exceptionnellement compte tenu des perturbations majeures..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800 transition-all placeholder:text-slate-400"
                    ></textarea>
                  </div>

                  {/* Boutons d'Action (Supprimer, Rejeter, Valider et Régulariser) */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setDeleteTarget(selectedAbsence._id)}
                      className="w-full sm:w-auto px-4 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        disabled={actionLoading}
                        onClick={handleReject}
                        className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all cursor-pointer"
                      >
                        Rejeter / Non justifiée
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={handleValidateRegularize}
                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Valider et régulariser</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* CARTE 2 : STATUT & SUIVI RH POUR L'EMPLOYÉ */
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <h3 className="text-base font-black text-slate-900">
                        Statut de votre demande & Traitement RH
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Suivi personnel
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">État de la déclaration :</span>
                      {selectedAbsence.justifiee ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Justifiée & Acceptée RH
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5" /> En cours d'examen RH
                        </span>
                      )}
                    </div>

                    {selectedAbsence.retardMinutes > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Durée du retard enregistré :</span>
                        <span className="font-bold text-slate-900">{selectedAbsence.retardMinutes} minutes</span>
                      </div>
                    )}

                    {(selectedAbsence.heureArrivee || selectedAbsence.heureDepart) && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Horaires constatés :</span>
                        <span className="font-bold text-slate-900">
                          {selectedAbsence.heureArrivee || "--:--"} → {selectedAbsence.heureDepart || "--:--"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Remarques du service RH :</label>
                    <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-slate-700 font-medium">
                      {selectedAbsence.commentaire || "Aucune remarque particulière du service RH pour le moment."}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Aucun dossier sélectionné</h3>
              <p className="text-xs text-slate-400 mt-1">
                Sélectionnez une demande dans la liste à gauche pour afficher les détails et appliquer une décision RH.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODALE DE CRÉATION / DÉCLARATION (ADMIN SEULEMENT) */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Déclarer un retard / absence
                </h2>
                <p className="text-xs text-slate-500">
                  Enregistrer un nouvel incident ou régularisation RH
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Employé */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Employé concerné <span className="text-rose-500">*</span>
                </label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleFormChange}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                >
                  <option value="">-- Choisir un collaborateur --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.matricule} - {emp.nom} {emp.prenom} ({emp.poste})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de l'incident <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type d'incident <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                  >
                    <option value="Retard">Retard</option>
                    <option value="Absence">Absence / Arrêt Maladie</option>
                    <option value="Départ anticipé">Départ anticipé</option>
                    <option value="Télétravail">Télétravail</option>
                  </select>
                </div>
              </div>

              {/* Retard en minutes */}
              {formData.type === "Retard" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Durée du retard (en minutes)
                  </label>
                  <input
                    type="number"
                    name="retardMinutes"
                    min="1"
                    max="480"
                    placeholder="ex: 45"
                    value={formData.retardMinutes}
                    onChange={handleFormChange}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                  />
                </div>
              )}

              {/* Heures d'arrivée / départ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heure d'arrivée
                  </label>
                  <input
                    type="time"
                    name="heureArrivee"
                    value={formData.heureArrivee}
                    onChange={handleFormChange}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heure de départ
                  </label>
                  <input
                    type="time"
                    name="heureDepart"
                    value={formData.heureDepart}
                    onChange={handleFormChange}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Motif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motif / Justification déclarée
                </label>
                <textarea
                  name="motif"
                  rows="2"
                  placeholder="Ex: Panne de train SNCF, rendez-vous médical imprévu..."
                  value={formData.motif}
                  onChange={handleFormChange}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                ></textarea>
              </div>

              {/* Justifiée Checkbox */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="justifiee"
                  name="justifiee"
                  checked={formData.justifiee}
                  onChange={handleFormChange}
                  className="rounded accent-blue-600 w-4 h-4"
                />
                <label htmlFor="justifiee" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Marquer immédiatement comme justifiée (avec justificatif reçu)
                </label>
              </div>

              {/* Boutons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Enregistrer la déclaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}