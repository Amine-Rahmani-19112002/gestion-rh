import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Trash2, Edit, X, Mail, Phone, 
  Send, ShieldCheck, ShieldAlert, ShieldOff, 
  UserX, UserCheck, UserPlus, Clock, CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import api from "../api/axios";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionBanner, setActionBanner] = useState(null);

  // État du modal d'information : Rôle admin terminé, en attente d'activation par l'employé
  const [completionModalInfo, setCompletionModalInfo] = useState(null);

  // Initialisation de tous les champs selon le schéma Mongoose
  const initialFormState = {
    matricule: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    poste: "",
    departement: "Engineering",
    typeContrat: "CDI",
    dateEmbauche: "",
    salaire: 0,
    statut: "Actif",
    sendInvitation: true,
    role: "employe",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des employés", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
    setFormError("");
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Pré-remplissage du formulaire pour l'édition (Update)
  const handleOpenEditModal = (emp) => {
    setEditingId(emp._id);
    setFormData({
      matricule: emp.matricule || "",
      nom: emp.nom || "",
      prenom: emp.prenom || "",
      email: emp.email || "",
      telephone: emp.telephone || "",
      adresse: emp.adresse || "",
      poste: emp.poste || "",
      departement: emp.departement || "Engineering",
      typeContrat: emp.typeContrat || "CDI",
      dateEmbauche: emp.dateEmbauche ? new Date(emp.dateEmbauche).toISOString().split('T')[0] : "",
      salaire: emp.salaire || 0,
      statut: emp.statut || "Actif",
      sendInvitation: false,
      role: emp.userAccount?.role || "employe",
    });
    setIsModalOpen(true);
  };

  // Soumission unique (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, formData);
        setActionBanner({ type: "success", message: "Fiche collaborateur mise à jour." });
      } else {
        const res = await api.post("/employees", formData);
        setActionBanner({ 
          type: "success", 
          message: res.data.message || "Collaborateur ajouté avec succès. Votre rôle est terminé en attente de l'activation par l'employé." 
        });
        if (formData.sendInvitation) {
          setCompletionModalInfo({
            name: `${formData.prenom} ${formData.nom}`,
            email: formData.email,
            actionType: "created",
          });
        }
      }
      handleCloseModal();
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé et tous ses accès ?")) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter((emp) => emp._id !== id));
        setActionBanner({ type: "success", message: "Collaborateur supprimé avec succès." });
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  // Inviter un employé qui n'a pas encore de compte utilisateur
  const handleInvite = async (empId) => {
    setActionLoadingId(empId);
    setActionBanner(null);
    try {
      const res = await api.post("/users/invite", { employeeId: empId });
      setActionBanner({ type: "success", message: res.data.message });
      const targetEmp = employees.find((e) => e._id === empId);
      setCompletionModalInfo({
        name: targetEmp ? `${targetEmp.prenom} ${targetEmp.nom}` : (res.data.user?.name || "Collaborateur"),
        email: targetEmp?.email || res.data.user?.email,
        actionType: "invited",
      });
      fetchEmployees();
    } catch (err) {
      setActionBanner({
        type: "error",
        message: err.response?.data?.message || "Erreur lors de l'envoi de l'invitation."
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Renvoyer l'invitation avec un nouveau jeton sécurisé
  const handleResendInvite = async (userId, empId) => {
    setActionLoadingId(empId);
    setActionBanner(null);
    try {
      const res = await api.post(`/users/${userId}/resend-invite`);
      setActionBanner({ type: "success", message: res.data.message });
      const targetEmp = employees.find((e) => e._id === empId);
      setCompletionModalInfo({
        name: targetEmp ? `${targetEmp.prenom} ${targetEmp.nom}` : "Collaborateur",
        email: targetEmp?.email,
        actionType: "resent",
      });
      fetchEmployees();
    } catch (err) {
      setActionBanner({
        type: "error",
        message: err.response?.data?.message || "Erreur lors du renvoi de l'invitation."
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Offboarding / Suspension / Réactivation du compte
  const handleToggleStatus = async (userId, nextStatus, empId) => {
    const isSuspending = nextStatus === "suspended";
    const confirmMsg = isSuspending
      ? "Offboarding : Voulez-vous vraiment suspendre l'accès de ce collaborateur ? Il ne pourra plus se connecter."
      : "Voulez-vous réactiver l'accès de ce collaborateur ?";

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(empId);
    setActionBanner(null);
    try {
      const res = await api.patch(`/users/${userId}/status`, { status: nextStatus });
      setActionBanner({ type: "success", message: res.data.message });
      fetchEmployees();
    } catch (err) {
      setActionBanner({
        type: "error",
        message: err.response?.data?.message || "Erreur lors de la mise à jour du statut."
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.nom?.toLowerCase().includes(term) ||
      emp.prenom?.toLowerCase().includes(term) ||
      emp.matricule?.toLowerCase().includes(term) ||
      emp.departement?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        <main className="p-8 space-y-6 max-w-[1600px]">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Répertoire des Employés</h1>
              <p className="text-slate-500 text-sm mt-1">
                Gérez vos équipes, invitations Zero Knowledge et accès sécurisés.
              </p>
            </div>

            {user.role === "admin" && (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                <Plus className="w-5 h-5" /> Ajouter un employé
              </button>
            )}
          </div>

          {/* Action Notification Banner */}
          {actionBanner && (
            <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in-up ${
              actionBanner.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              <div className="flex items-center gap-2.5">
                {actionBanner.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{actionBanner.message}</span>
              </div>
              <button 
                onClick={() => setActionBanner(null)} 
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email, matricule, département..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          {/* TABLEAU */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-semibold animate-pulse">Chargement des données...</div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 text-center text-slate-500">Aucun employé trouvé.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Employé</th>
                      <th className="py-4 px-6">Matricule</th>
                      <th className="py-4 px-6">Département & Poste</th>
                      <th className="py-4 px-6">Statut RH</th>
                      <th className="py-4 px-6">Accès Système</th>
                      <th className="py-4 px-6">Contact</th>
                      {user.role === "admin" && <th className="py-4 px-6 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {filteredEmployees.map((emp) => {
                      const userAccount = emp.userAccount;
                      const isActing = actionLoadingId === emp._id;

                      return (
                        <tr key={emp._id} className="hover:bg-slate-50/80 transition-all">
                          
                          {/* Nom & Email */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                {emp.prenom?.charAt(0)}{emp.nom?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{emp.prenom} {emp.nom}</p>
                                <p className="text-xs text-slate-400">{emp.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Matricule */}
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
                              {emp.matricule}
                            </span>
                          </td>

                          {/* Poste & Département */}
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-800">{emp.poste}</p>
                            <p className="text-xs text-slate-400">{emp.departement}</p>
                          </td>

                          {/* Statut RH & Contrat */}
                          <td className="py-4 px-6 space-y-1">
                            <div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                emp.statut === "Actif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                emp.statut === "En congé" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {emp.statut}
                              </span>
                            </div>
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                                {emp.typeContrat}
                              </span>
                            </div>
                          </td>

                          {/* Accès Système & Statut Compte */}
                          <td className="py-4 px-6">
                            {userAccount?.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Compte Actif
                              </span>
                            ) : userAccount?.status === "pending" ? (
                              <span 
                                title="Rôle administrateur terminé : en attente d'activation par le collaborateur."
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                En attente d'activation
                              </span>
                            ) : userAccount?.status === "suspended" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                Suspendu
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                <ShieldOff className="w-3.5 h-3.5 text-slate-400" />
                                Non invité
                              </span>
                            )}
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-6 text-slate-500 text-xs space-y-0.5">
                            <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {emp.email}</div>
                            {emp.telephone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {emp.telephone}</div>}
                          </td>

                          {/* Actions Admin */}
                          {user.role === "admin" && (
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1">
                                
                                {/* Action Compte / Invitation */}
                                {!userAccount ? (
                                  <button
                                    onClick={() => handleInvite(emp._id)}
                                    disabled={isActing}
                                    title="Inviter (Créer compte Zero Knowledge)"
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  >
                                    <UserPlus className="w-4 h-4" />
                                  </button>
                                ) : userAccount.status === "pending" ? (
                                  <button
                                    onClick={() => handleResendInvite(userAccount._id, emp._id)}
                                    disabled={isActing}
                                    title="Renvoyer l'e-mail d'activation"
                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                ) : userAccount.status === "active" ? (
                                  <button
                                    onClick={() => handleToggleStatus(userAccount._id, "suspended", emp._id)}
                                    disabled={isActing}
                                    title="Offboarding : Suspendre l'accès"
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleStatus(userAccount._id, "active", emp._id)}
                                    disabled={isActing}
                                    title="Réactiver le compte"
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Modifier Fiche */}
                                <button 
                                  onClick={() => handleOpenEditModal(emp)} 
                                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all" 
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* Supprimer Fiche */}
                                <button 
                                  onClick={() => handleDelete(emp._id)} 
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODALE D'AJOUT / MODIFICATION COMPLÈTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
              {editingId ? "Modifier le collaborateur" : "Nouveau collaborateur"}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Remplissez les champs ci-dessous pour mettre à jour la fiche de l'employé.
            </p>

            {formError && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Option d'invitation Zero Knowledge lors de la création */}
              {!editingId && (
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.sendInvitation}
                      onChange={(e) => setFormData({ ...formData, sendInvitation: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Créer un accès utilisateur et envoyer automatiquement l'e-mail d'invitation
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        🔒 <strong>Principe Zero Knowledge</strong> : Le serveur génère un jeton sécurisé à durée limitée (48h). L'employé définira son propre mot de passe personnalisé.
                      </p>
                    </div>
                  </label>

                  {formData.sendInvitation && (
                    <div className="pt-2 border-t border-blue-100/80 flex items-center gap-4">
                      <label className="text-xs font-bold text-slate-700">Rôle de l'accès :</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="employe">Collaborateur (Employé)</option>
                        <option value="admin">Administrateur RH</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Matricule & Statut RH */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Matricule *</label>
                  <input type="text" required value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 uppercase" placeholder="EX: EMP-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut RH</label>
                  <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif (Suspend l'accès)</option>
                    <option value="En congé">En congé</option>
                  </select>
                </div>
              </div>

              {/* Prénom & Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                  <input type="text" required value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                  <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Email & Téléphone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email professionnel *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                  <input type="text" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse</label>
                <input type="text" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" placeholder="Avenue, Ville, Code Postal" />
              </div>

              {/* Poste & Département */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Poste / Intitulé *</label>
                  <input type="text" required value={formData.poste} onChange={(e) => setFormData({...formData, poste: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Département *</label>
                  <select value={formData.departement} onChange={(e) => setFormData({...formData, departement: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500">
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="RH">RH</option>
                  </select>
                </div>
              </div>

              {/* Type contrat, Date embauche & Salaire */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type Contrat</label>
                  <select value={formData.typeContrat} onChange={(e) => setFormData({...formData, typeContrat: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date Embauche *</label>
                  <input type="date" required value={formData.dateEmbauche} onChange={(e) => setFormData({...formData, dateEmbauche: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salaire (€)</label>
                  <input type="number" min="0" value={formData.salaire} onChange={(e) => setFormData({...formData, salaire: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-5 py-3 border border-slate-200 font-bold text-sm text-slate-600 rounded-xl hover:bg-slate-50">Annuler</button>
                <button type="submit" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white rounded-xl shadow-md shadow-blue-500/20">
                  {editingId ? "Mettre à jour" : "Enregistrer et Inviter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INFORMATION : RÔLE TERMINÉ & EN ATTENTE D'ACTIVATION EMPLOYÉ */}
      {completionModalInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-fade-in-up">
            <button 
              onClick={() => setCompletionModalInfo(null)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            {/* En-tête */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {completionModalInfo.actionType === "created"
                    ? "Collaborateur créé — Rôle terminé"
                    : completionModalInfo.actionType === "resent"
                    ? "Invitation renvoyée — Rôle terminé"
                    : "Invitation transmise — Rôle terminé"}
                </h3>
                <p className="text-xs text-slate-500">
                  Pour <strong>{completionModalInfo.name}</strong> ({completionModalInfo.email})
                </p>
              </div>
            </div>

            {/* Explications rôle terminé & attente activation employé */}
            <div className="space-y-3.5 mb-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5">
                <p className="font-bold flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Votre mission d'administrateur est terminée
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Le dossier a été enregistré et l'invitation d'accès a été transmise à l'adresse e-mail professionnelle de l'employé.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-2 text-amber-800">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  En attente de l'activation par l'employé
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Pour garantir la sécurité et la confidentialité, aucun lien ni mot de passe n'est fourni à l'administrateur. L'employé doit ouvrir son invitation par e-mail et choisir lui-même son mot de passe pour activer son compte.
                </p>
              </div>
            </div>

            {/* Statut visuel récapitulatif */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs mb-6">
              <span className="text-slate-500 font-medium">Statut actuel du compte :</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                En attente d'activation employé
              </span>
            </div>

            {/* Bouton unique de fermeture */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCompletionModalInfo(null)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
              >
                Compris, fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;