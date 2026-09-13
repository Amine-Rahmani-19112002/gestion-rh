import React, { useState, useEffect } from "react";
import { 
  PlusCircle, Filter, CheckCircle2, XCircle, 
  Clock, AlertCircle, Trash2, Check, X, Calendar, Edit3, Save
} from "lucide-react";
import api from "../api/axios";

const Leave = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = storedUser?.role === "admin";

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterStatut, setFilterStatut] = useState("");
  const [loading, setLoading] = useState(true);

  // État pour savoir si on est en création ou en édition
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    employee: "",
    typeConge: "Congé Payé",
    dateDebut: "",
    dateFin: "",
    motif: "",
  });

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [commentaireAdmin, setCommentaireAdmin] = useState("");
  
  // État de l'alerte modale centrée
  const [modalAlert, setModalAlert] = useState({ open: false, type: "", text: "" });

  const showAlert = (type, text) => {
    setModalAlert({ open: true, type, text });
  };

  const closeAlert = () => {
    setModalAlert({ open: false, type: "", text: "" });
  };

  const fetchLeaves = async () => {
    try {
      const url = filterStatut
        ? `/leaves?statut=${encodeURIComponent(filterStatut)}`
        : "/leaves";
      const { data } = await api.get(url);
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
  }, [filterStatut]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Traitement Création ou Modification
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Mode Modification
        const { data } = await api.put(`/leaves/${editingId}`, formData);
        showAlert("success", data.message || "Demande modifiée avec succès.");
        setEditingId(null);
      } else {
        // Mode Création
        const { data } = await api.post("/leaves", formData);
        showAlert("success", data.message || "Demande créée avec succès.");
      }

      setFormData({
        employee: "",
        typeConge: "Congé Payé",
        dateDebut: "",
        dateFin: "",
        motif: "",
      });
      fetchLeaves();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  // Préparer le formulaire pour la modification
  const handleEditClick = (leave) => {
    setEditingId(leave._id);
    
    // Formater la date pour l'input date (YYYY-MM-DD)
    const formattedDebut = leave.dateDebut ? new Date(leave.dateDebut).toISOString().split('T')[0] : "";
    const formattedFin = leave.dateFin ? new Date(leave.dateFin).toISOString().split('T')[0] : "";

    setFormData({
      employee: leave.employee?._id || leave.employee || "",
      typeConge: leave.typeConge || "Congé Payé",
      dateDebut: formattedDebut,
      dateFin: formattedFin,
      motif: leave.motif || "",
    });

    // Remonter en haut de la page vers le formulaire
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({
      employee: "",
      typeConge: "Congé Payé",
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
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  const renderBadge = (statut) => {
    switch (statut) {
      case "Approuvé":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approuvé
          </span>
        );
      case "Refusé":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Refusé
          </span>
        );
      case "Annulé":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5" /> Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> En attente
          </span>
        );
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-500 font-medium">Chargement des données...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1500px] relative">
      
      {/* 1. MODALE D'ALERTE CENTRÉE SUR L'ÉCRAN */}
      {modalAlert.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center transform transition-all animate-in fade-in zoom-in duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
              modalAlert.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            }`}>
              {modalAlert.type === "success" ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {modalAlert.type === "success" ? "Succès" : "Erreur"}
            </h3>

            <p className="text-xs text-slate-600 font-medium">
              {modalAlert.text}
            </p>

            <button
              onClick={closeAlert}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all ${
                modalAlert.type === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              D'accord
            </button>
          </div>
        </div>
      )}

      {/* FORMULAIRE DE DEMANDE / MODIFICATION */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editingId ? (
              <Edit3 className="w-5 h-5 text-amber-600" />
            ) : (
              <PlusCircle className="w-5 h-5 text-blue-600" />
            )}
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? "Modifier la Demande de Congé" : "Nouvelle Demande de Congé"}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={cancelEditing}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
            >
              Annuler la modification
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sélectionner l'Employé <span className="text-rose-500">*</span>
              </label>
              <select
                name="employee"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type de Congé</label>
              <select
                name="typeConge"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                value={formData.typeConge}
                onChange={handleChange}
              >
                <option value="Congé Payé">Congé Payé</option>
                <option value="Maladie">Maladie</option>
                <option value="Sans Solde">Sans Solde</option>
                <option value="Maternité/Paternité">Maternité/Paternité</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de Début <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="dateDebut"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                value={formData.dateDebut}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de Fin <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="dateFin"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                value={formData.dateFin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Motif</label>
            <textarea
              name="motif"
              rows="2"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              placeholder="Précisez le motif de la demande..."
              value={formData.motif}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 ${
                editingId ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {editingId ? (
                <>
                  <Save className="w-4 h-4" /> Mettre à jour la Demande
                </>
              ) : (
                "Envoyer la Demande"
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* TABLEAU HISTORIQUE */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Historique des Demandes</h3>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-700"
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Approuvé">Approuvé</option>
              <option value="Refusé">Refusé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Employé</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Période</th>
                <th className="py-3 px-6">Durée</th>
                <th className="py-3 px-6">Statut</th>
                <th className="py-3 px-6">Remarque Admin</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    Aucune demande de congé trouvée.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id || Math.random()} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {leave.employee ? (
                        <div>
                          <p className="font-bold">{leave.employee.nom} {leave.employee.prenom}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{leave.employee.matricule}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 font-medium">{leave.typeConge || "-"}</td>
                    <td className="py-3.5 px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(leave.dateDebut)} — {formatDate(leave.dateFin)}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-800">{leave.nombreJours ?? 0} j</td>
                    <td className="py-3.5 px-6">{renderBadge(leave.statut)}</td>
                    <td className="py-3.5 px-6 text-slate-500 italic">{leave.commentaireAdmin || "-"}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Actions Administrateur */}
                        {isAdmin && leave.statut === "En attente" && (
                          <>
                            <button
                              title="Approuver"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setActionType("approve");
                              }}
                              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              title="Refuser"
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

                        {/* Actions uniquement si EN ATTENTE */}
                        {leave.statut === "En attente" && (
                          <>
                            {/* BOUTON MODIFIER */}
                            <button
                              title="Modifier la demande"
                              onClick={() => handleEditClick(leave)}
                              className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* BOUTON SUPPRIMER/ANNULER */}
                            <button
                              title="Annuler la demande"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE DECISION ADMIN */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {actionType === "approve" ? "Approuver la demande" : "Refuser la demande"}
              </h3>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p>
                <strong className="text-slate-800">Employé :</strong> {selectedLeave.employee?.nom}{" "}
                {selectedLeave.employee?.prenom}
              </p>
              <p>
                <strong className="text-slate-800">Période :</strong>{" "}
                {formatDate(selectedLeave.dateDebut)} au {formatDate(selectedLeave.dateFin)} ({selectedLeave.nombreJours ?? 0} jours)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Commentaire Administrateur (Optionnel)
              </label>
              <textarea
                rows="3"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                value={commentaireAdmin}
                onChange={(e) => setCommentaireAdmin(e.target.value)}
                placeholder="Entrez un motif ou une remarque..."
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                onClick={() => setSelectedLeave(null)}
              >
                Fermer
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-bold text-xs rounded-xl text-white shadow-sm transition-all ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
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
};

export default Leave;