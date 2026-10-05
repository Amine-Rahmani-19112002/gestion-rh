import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useOutletContext } from 'react-router-dom';
import { 
  FileText, Search, Plus, Filter, MoreVertical, ShieldAlert,
  AlertCircle, Briefcase, FileSignature, DollarSign,
  ChevronLeft, ChevronRight, CheckCircle2, Clock, 
  X, PenSquare, Trash2
} from 'lucide-react';

const Contracts = () => {
  const { profile } = useOutletContext();
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({
    totalActive: 0,
    expiringCdd: 0,
    avenantsCount: 0,
    masseSalariale: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('Tous les départements');
  const [statusFilter, setStatusFilter] = useState('Tous les statuts');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    collaborateurNom: '',
    matricule: '',
    poste: '',
    departement: '',
    typeContrat: 'CDI',
    dateDebut: '',
    dateFin: '',
    statut: 'En cours',
    remunerationAnnuelle: '',
  });

  useEffect(() => {
    fetchContracts();
    fetchStats();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contracts');
      setContracts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/contracts/stats');
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce contrat ?')) {
      try {
        await api.delete(`/contracts/${id}`);
        fetchContracts();
        fetchStats();
      } catch (error) {
        console.error('Erreur lors de la suppression', error);
      }
    }
  };

  const handleOpenModal = (contract = null) => {
    if (contract) {
      setEditingId(contract._id);
      setFormData({
        collaborateurNom: contract.collaborateurNom || '',
        matricule: contract.matricule || '',
        poste: contract.poste || '',
        departement: contract.departement || '',
        typeContrat: contract.typeContrat || 'CDI',
        dateDebut: contract.dateDebut ? contract.dateDebut.split('T')[0] : '',
        dateFin: contract.dateFin ? contract.dateFin.split('T')[0] : '',
        statut: contract.statut || 'En cours',
        remunerationAnnuelle: contract.remunerationAnnuelle || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        collaborateurNom: '',
        matricule: '',
        poste: '',
        departement: '',
        typeContrat: 'CDI',
        dateDebut: '',
        dateFin: '',
        statut: 'En cours',
        remunerationAnnuelle: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/contracts/${editingId}`, formData);
      } else {
        await api.post('/contracts', formData);
      }
      setIsModalOpen(false);
      fetchContracts();
      fetchStats();
    } catch (error) {
      console.error('Erreur de sauvegarde', error);
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchSearch = c.collaborateurNom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = departmentFilter === 'Tous les départements' || c.departement === departmentFilter;
      const matchStatus = statusFilter === 'Tous les statuts' || c.statut === statusFilter;
      
      let matchTab = true;
      if (activeTab === 'CDI') matchTab = c.typeContrat === 'CDI' || c.typeContrat === 'CDI Cadre';
      else if (activeTab === 'CDD & Temporaires') matchTab = ['CDD', 'CDD Remplacement', 'Stage', 'Alternance'].includes(c.typeContrat);
      else if (activeTab === 'En cours de signature') matchTab = c.statut === 'En cours' || c.statut === 'Signature Avenant en cours';

      return matchSearch && matchDept && matchStatus && matchTab;
    });
  }, [contracts, searchTerm, departmentFilter, statusFilter, activeTab]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Actif & Signé':
      case 'Dossier Conforme':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Signature Avenant en cours':
      case 'En cours':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Échéance Essai Imminente':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeBadge = (type) => {
    if(type?.includes('CDI')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if(type?.includes('CDD')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <FileText className="w-3 h-3" />
              MODULE JURIDIQUE RH
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Contrats & Statuts</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez le cycle de vie contractuel et les documents légaux des collaborateurs.</p>
        </div>
        
        {profile?.role === 'admin' && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau contrat
          </button>
        )}
      </div>

      {/* Alert Banner */}
      {stats.expiringCdd > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-900">Alertes Juridiques ({stats.expiringCdd})</h3>
            <p className="text-xs text-rose-700 mt-1">Vous avez {stats.expiringCdd} contrat(s) CDD ou périodes d'essai arrivant à échéance dans les 30 prochains jours.</p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Contrats Actifs</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalActive}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Échéances Proches</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.expiringCdd}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Avenants en Signature</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.avenantsCount}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Masse Salariale Engagée</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats.masseSalariale)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 border-b border-slate-100 bg-slate-50/50">
          {['Tous', 'CDI', 'CDD & Temporaires', 'En cours de signature'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher un collaborateur, matricule..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option>Tous les départements</option>
              <option>IT & Data</option>
              <option>Ressources Humaines</option>
              <option>Marketing</option>
              <option>Finance</option>
            </select>
            
            <select 
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Tous les statuts</option>
              <option>Actif & Signé</option>
              <option>En cours</option>
              <option>Dossier Conforme</option>
              <option>Signature Avenant en cours</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collaborateur</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Poste & Pôle</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type de contrat</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Période & Échéance</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rémunération</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Chargement des contrats...</td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Aucun contrat trouvé.</td>
                </tr>
              ) : (
                filteredContracts.map(contract => (
                  <tr key={contract._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {contract.collaborateurNom ? contract.collaborateurNom.substring(0, 2).toUpperCase() : 'XX'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{contract.collaborateurNom}</p>
                          <p className="text-xs text-slate-500">{contract.matricule || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{contract.poste}</p>
                      <p className="text-xs text-slate-500">{contract.departement}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold border ${getTypeBadge(contract.typeContrat)}`}>
                        {contract.typeContrat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm">
                        <span className="text-slate-900">Du {contract.dateDebut ? new Date(contract.dateDebut).toLocaleDateString('fr-FR') : '-'}</span>
                        <span className="text-slate-500 text-xs">Au {contract.dateFin ? new Date(contract.dateFin).toLocaleDateString('fr-FR') : 'Indéterminé'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(contract.remunerationAnnuelle)} / an</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(contract.statut)}`}>
                        {contract.statut === 'Actif & Signé' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {contract.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {profile?.role === 'admin' && (
                          <>
                            <button 
                              onClick={() => handleOpenModal(contract)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <PenSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(contract._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création/édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {editingId ? 'Modifier le contrat' : 'Nouveau contrat'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nom du collaborateur *</label>
                  <input required type="text" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.collaborateurNom} onChange={e => setFormData({...formData, collaborateurNom: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Matricule</label>
                  <input type="text" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.matricule} onChange={e => setFormData({...formData, matricule: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Poste</label>
                  <input type="text" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.poste} onChange={e => setFormData({...formData, poste: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Département</label>
                  <input type="text" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.departement} onChange={e => setFormData({...formData, departement: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Type de contrat *</label>
                  <select required className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.typeContrat} onChange={e => setFormData({...formData, typeContrat: e.target.value})}>
                    <option value="CDI Cadre">CDI Cadre</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD Remplacement">CDD Remplacement</option>
                    <option value="CDD">CDD</option>
                    <option value="CDI Essai">CDI Essai</option>
                    <option value="Alternance">Alternance</option>
                    <option value="Contrat Prestation Cadre">Contrat Prestation Cadre</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Statut</label>
                  <select className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})}>
                    <option value="Actif & Signé">Actif & Signé</option>
                    <option value="Signature Avenant en cours">Signature Avenant en cours</option>
                    <option value="Renouvellement / Sortie">Renouvellement / Sortie</option>
                    <option value="Échéance Essai Imminente">Échéance Essai Imminente</option>
                    <option value="Dossier Conforme">Dossier Conforme</option>
                    <option value="Bon de commande N°4 en cours">Bon de commande N°4 en cours</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Date de début</label>
                  <input type="date" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.dateDebut} onChange={e => setFormData({...formData, dateDebut: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Date de fin</label>
                  <input type="date" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.dateFin} onChange={e => setFormData({...formData, dateFin: e.target.value})} />
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Rémunération annuelle brute (€)</label>
                  <input type="number" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.remunerationAnnuelle} onChange={e => setFormData({...formData, remunerationAnnuelle: e.target.value})} />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                  {editingId ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
