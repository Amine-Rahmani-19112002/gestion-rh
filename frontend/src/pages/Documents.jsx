import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useOutletContext } from 'react-router-dom';
import { 
  FolderLock, Search, Plus, Filter, MoreVertical, Database,
  FileBadge, Users, CheckCircle, UploadCloud,
  X, PenSquare, Trash2, File as FileIcon, FileText, Image as ImageIcon
} from 'lucide-react';

const Documents = () => {
  const { profile } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    byCategory: {},
    alertsCount: 0,
    complianceRate: 100
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes les catégories');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    format: 'pdf',
    categorie: 'Contrats RH',
    collaborateurNom: '',
    collaborateurPoste: '',
    confidentialite: 'RH & Collaborateur',
    statut: 'Conforme',
    taille: '1.2 MB'
  });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/documents');
      setDocuments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des documents', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/documents/stats');
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce document ?')) {
      try {
        await api.delete(`/documents/${id}`);
        fetchDocuments();
        fetchStats();
      } catch (error) {
        console.error('Erreur lors de la suppression', error);
      }
    }
  };

  const handleOpenModal = (doc = null) => {
    if (doc) {
      setEditingId(doc._id);
      setFormData({
        nom: doc.nom || '',
        format: doc.format || 'pdf',
        categorie: doc.categorie || 'Contrats RH',
        collaborateurNom: doc.collaborateurNom || '',
        collaborateurPoste: doc.collaborateurPoste || '',
        confidentialite: doc.confidentialite || 'RH & Collaborateur',
        statut: doc.statut || 'Conforme',
        taille: doc.taille || '1.2 MB',
      });
    } else {
      setEditingId(null);
      setFormData({
        nom: '',
        format: 'pdf',
        categorie: 'Contrats RH',
        collaborateurNom: '',
        collaborateurPoste: '',
        confidentialite: 'RH & Collaborateur',
        statut: 'Conforme',
        taille: '1.2 MB'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/documents/${editingId}`, formData);
      } else {
        await api.post('/documents', formData);
      }
      setIsModalOpen(false);
      fetchDocuments();
      fetchStats();
    } catch (error) {
      console.error('Erreur de sauvegarde', error);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.collaborateurNom?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'Toutes les catégories' || doc.categorie === categoryFilter;
      
      return matchSearch && matchCat;
    });
  }, [documents, searchTerm, categoryFilter]);

  const getFormatIcon = (format) => {
    switch(format) {
      case 'pdf': return <FileIcon className="w-5 h-5 text-rose-500" />;
      case 'png': return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'docx': return <FileText className="w-5 h-5 text-blue-600" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getConfidentialityBadge = (conf) => {
    switch(conf) {
      case 'Salarié uniquement': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RH & Collaborateur': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Confidentiel Direction': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Public Entreprise': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getCategoryBadge = (cat) => {
    switch(cat) {
      case 'Bulletins de Paie': return 'bg-blue-100 text-blue-700';
      case 'Contrats RH': return 'bg-emerald-100 text-emerald-700';
      case 'Justificatifs légaux': return 'bg-rose-100 text-rose-700';
      case 'Règlements & Politiques': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <FolderLock className="w-3 h-3" />
              GED SÉCURISÉE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Documents & GED RH</h1>
          <p className="text-sm text-slate-500 mt-1">Plateforme de stockage chiffrée avec conformité eIDAS et horodatage légal.</p>
        </div>
        
        {profile?.role === 'admin' && (
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-blue-700 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Déposer un document
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-400" />
          <div>
            <p className="text-xs text-slate-400 font-medium">STOCKAGE UTILISÉ</p>
            <p className="text-lg font-bold">45.8 GB <span className="text-sm font-normal text-slate-400">/ 500 GB</span></p>
          </div>
        </div>
        <div className="hidden md:block w-px h-10 bg-slate-700"></div>
        <div className="flex items-center gap-3">
          <FileBadge className="w-8 h-8 text-emerald-400" />
          <div>
            <p className="text-xs text-slate-400 font-medium">CONFORMITÉ eIDAS</p>
            <p className="text-lg font-bold">{stats.complianceRate}% Sécurisé</p>
          </div>
        </div>
        <div className="hidden md:block w-px h-10 bg-slate-700"></div>
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-amber-400" />
          <div>
            <p className="text-xs text-slate-400 font-medium">DISTRIBUTION (Mois)</p>
            <p className="text-lg font-bold">142 Documents envoyés</p>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-blue-500 border-y border-r border-y-slate-200/60 border-r-slate-200/60 shadow-sm cursor-pointer hover:bg-slate-50 transition" onClick={() => setCategoryFilter('Bulletins de Paie')}>
          <h3 className="font-bold text-slate-900">Bulletins de Paie</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{stats.byCategory['Bulletins de Paie'] || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-emerald-500 border-y border-r border-y-slate-200/60 border-r-slate-200/60 shadow-sm cursor-pointer hover:bg-slate-50 transition" onClick={() => setCategoryFilter('Contrats RH')}>
          <h3 className="font-bold text-slate-900">Contrats & Avenants</h3>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{stats.byCategory['Contrats RH'] || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-rose-500 border-y border-r border-y-slate-200/60 border-r-slate-200/60 shadow-sm cursor-pointer hover:bg-slate-50 transition" onClick={() => setCategoryFilter('Justificatifs légaux')}>
          <h3 className="font-bold text-slate-900">Justificatifs & Identités</h3>
          <p className="text-2xl font-bold text-rose-600 mt-2">{stats.byCategory['Justificatifs légaux'] || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-indigo-500 border-y border-r border-y-slate-200/60 border-r-slate-200/60 shadow-sm cursor-pointer hover:bg-slate-50 transition" onClick={() => setCategoryFilter('Règlements & Politiques')}>
          <h3 className="font-bold text-slate-900">Règlements & Politiques</h3>
          <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.byCategory['Règlements & Politiques'] || 0}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher un document, collaborateur..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-slate-200 bg-white text-slate-500 rounded-xl hover:bg-slate-50">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="font-medium text-slate-900">{filteredDocuments.length}</span> documents trouvés
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-10">
                  <input type="checkbox" className="rounded text-blue-600 border-slate-300 focus:ring-blue-500" />
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nom du document</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Collaborateur associé</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date & Taille</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Confidentialité</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Chargement des documents...</td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Aucun document trouvé.</td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded text-blue-600 border-slate-300 focus:ring-blue-500" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getFormatIcon(doc.format)}
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{doc.nom}</p>
                          <p className="text-[10px] text-slate-500 font-mono">SHA256: {doc.hashSha256 || '...A9F2B'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-bold ${getCategoryBadge(doc.categorie)}`}>
                        {doc.categorie}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {doc.collaborateurNom ? doc.collaborateurNom.substring(0, 2).toUpperCase() : 'XX'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.collaborateurNom || 'Non assigné'}</p>
                          <p className="text-xs text-slate-500">{doc.collaborateurPoste || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-900">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('fr-FR') : '-'}</p>
                      <p className="text-xs text-slate-500">{doc.taille || '1.0 MB'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getConfidentialityBadge(doc.confidentialite)}`}>
                        {doc.confidentialite}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {profile?.role === 'admin' && (
                          <>
                            <button 
                              onClick={() => handleOpenModal(doc)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <PenSquare className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(doc._id)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-indigo-600" />
                {editingId ? 'Modifier le document' : 'Déposer un document'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nom du fichier *</label>
                  <input required type="text" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Format</label>
                    <select className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                      <option value="pdf">PDF</option>
                      <option value="png">PNG / JPG</option>
                      <option value="docx">DOCX</option>
                      <option value="xlsx">XLSX</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Catégorie *</label>
                    <select required className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})}>
                      <option value="Bulletins de Paie">Bulletins de Paie</option>
                      <option value="Contrats RH">Contrats RH</option>
                      <option value="Justificatifs légaux">Justificatifs légaux</option>
                      <option value="Attestations">Attestations</option>
                      <option value="Politiques RH">Politiques RH</option>
                      <option value="Pièce d'Identité">Pièce d'Identité</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Collaborateur (Optionnel)</label>
                  <input type="text" className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.collaborateurNom} onChange={e => setFormData({...formData, collaborateurNom: e.target.value})} placeholder="Nom Prénom" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Niveau de confidentialité *</label>
                  <select required className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    value={formData.confidentialite} onChange={e => setFormData({...formData, confidentialite: e.target.value})}>
                    <option value="Salarié uniquement">Salarié uniquement</option>
                    <option value="RH & Collaborateur">RH & Collaborateur</option>
                    <option value="Confidentiel Direction">Confidentiel Direction</option>
                    <option value="Public Entreprise">Public Entreprise</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  {editingId ? <CheckCircle className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                  {editingId ? 'Enregistrer' : 'Déposer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
