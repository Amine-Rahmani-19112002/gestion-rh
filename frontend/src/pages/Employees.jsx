import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Building2, CalendarX, FileText, 
  Award, Folder, Settings, Search, Bell, LogOut, Plus, 
  Trash2, Edit, X, Mail, Phone
} from "lucide-react";
import api from "../api/axios";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
    statut: "Actif"
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
      statut: emp.statut || "Actif"
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
      } else {
        await api.post("/employees", formData);
      }
      handleCloseModal();
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter((emp) => emp._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
              S
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Stratos<span className="text-blue-600">HR</span>
            </span>
          </div>

          <nav className="space-y-1.5">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-all">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/employees" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-sm transition-all">
              <Users className="w-5 h-5" />
              <span>Employees</span>
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-all">
              <Building2 className="w-5 h-5" />
              <span>Departments</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-all">
              <CalendarX className="w-5 h-5" />
              <span>Leaves & Absences</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-all">
              <FileText className="w-5 h-5" />
              <span>Contracts</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-all">
              <Award className="w-5 h-5" />
              <span>Evaluations</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-all">
              <Folder className="w-5 h-5" />
              <span>Documents</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-all">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </nav>
        </div>

        <div className="bg-[#0A1628] text-white p-5 rounded-2xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Support</p>
          <p className="text-xs text-slate-300 leading-relaxed">Need help with the platform? Contact support.</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, matricule, département..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100/80 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{user.name || "User"}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-100">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="p-8 space-y-6 max-w-[1600px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Répertoire des Employés</h1>
              <p className="text-slate-500 text-sm mt-1">Gérez vos équipes, contrats et données salariales.</p>
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
                      <th className="py-4 px-6">Contrat & Statut</th>
                      <th className="py-4 px-6">Contact</th>
                      {user.role === "admin" && <th className="py-4 px-6 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp._id} className="hover:bg-slate-50/80 transition-all">
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
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
                            {emp.matricule}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-800">{emp.poste}</p>
                          <p className="text-xs text-slate-400">{emp.departement}</p>
                        </td>
                        <td className="py-4 px-6 space-y-1">
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              {emp.typeContrat}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.statut === "Actif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              emp.statut === "En congé" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {emp.statut}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs space-y-0.5">
                          <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {emp.email}</div>
                          {emp.telephone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {emp.telephone}</div>}
                        </td>
                        {user.role === "admin" && (
                          <td className="py-4 px-6 text-right space-x-1">
                            <button onClick={() => handleOpenEditModal(emp)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Modifier">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(emp._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
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
              
              {/* Matricule & Statut */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Matricule *</label>
                  <input type="text" required value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 uppercase" placeholder="EX: EMP-001" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
                  <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
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
                  {editingId ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;