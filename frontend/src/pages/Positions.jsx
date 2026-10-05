import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { 
  Briefcase, Search, Filter, Plus, Edit2, Trash2, 
  X, CheckCircle, XCircle, AlertCircle, Building, CircleDollarSign
} from 'lucide-react';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  
  // Form
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    minimumSalary: '',
    maximumSalary: '',
    active: true
  });
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [posRes, depRes] = await Promise.all([
        api.get('/positions'),
        api.get('/departments')
      ]);
      setPositions(posRes.data);
      setDepartments(depRes.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (position = null) => {
    if (position) {
      setCurrentPosition(position);
      setFormData({
        title: position.title,
        department: position.department?._id || '',
        description: position.description || '',
        minimumSalary: position.minimumSalary || '',
        maximumSalary: position.maximumSalary || '',
        active: position.active
      });
    } else {
      setCurrentPosition(null);
      setFormData({
        title: '',
        department: '',
        description: '',
        minimumSalary: '',
        maximumSalary: '',
        active: true
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPosition(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.department || !formData.minimumSalary || !formData.maximumSalary) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const payload = {
        ...formData,
        minimumSalary: Number(formData.minimumSalary),
        maximumSalary: Number(formData.maximumSalary)
      };

      if (currentPosition) {
        await api.put(`/positions/${currentPosition._id}`, payload);
      } else {
        await api.post('/positions', payload);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  const confirmDelete = (position) => {
    setCurrentPosition(position);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/positions/${currentPosition._id}`);
      setIsDeleteModalOpen(false);
      setCurrentPosition(null);
      fetchData();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Filtering
  const filteredPositions = useMemo(() => {
    return positions.filter(pos => {
      const matchesSearch = pos.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDep = departmentFilter === 'all' || pos.department?._id === departmentFilter;
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'active' 
          ? pos.active 
          : !pos.active;

      return matchesSearch && matchesDep && matchesStatus;
    });
  }, [positions, searchTerm, departmentFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = positions.length;
    const active = positions.filter(p => p.active).length;
    const uniqueDeps = new Set(positions.map(p => p.department?._id).filter(Boolean)).size;
    
    let avgSalary = 0;
    if (total > 0) {
      const totalSalary = positions.reduce((acc, p) => acc + ((p.minimumSalary + p.maximumSalary) / 2), 0);
      avgSalary = totalSalary / total;
    }

    return { total, active, uniqueDeps, avgSalary };
  }, [positions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
              GESTION DES POSTES
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Postes & Fonctions</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les postes, leurs départements et leurs grilles salariales.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Nouveau Poste
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Postes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Postes Actifs</p>
            <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Départements Couverts</p>
            <p className="text-2xl font-bold text-slate-900">{stats.uniqueDeps}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <CircleDollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Salaire Moyen</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.avgSalary ? `${Math.round(stats.avgSalary).toLocaleString()} €` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher un poste..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
          />
        </div>
        <div className="w-48">
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
          >
            <option value="all">Tous les départements</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPositions.map(position => (
          <div key={position._id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4">
              <div>
                <h3 className="font-bold text-slate-900">{position.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                    {position.department?.name || 'Sans département'}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                    position.active 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {position.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleOpenModal(position)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => confirmDelete(position)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                {position.description || 'Aucune description.'}
              </p>
              
              <div className="mt-auto">
                <div className="text-xs text-slate-500 mb-1 font-medium">Fourchette Salariale</div>
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span>{position.minimumSalary?.toLocaleString()} €</span>
                  <span className="text-slate-400">-</span>
                  <span>{position.maximumSalary?.toLocaleString()} €</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-4 text-right">
                  Créé le {new Date(position.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPositions.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            Aucun poste trouvé correspondant à vos critères.
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900">
                {currentPosition ? 'Modifier le Poste' : 'Nouveau Poste'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre du Poste *
                </label>
                <input 
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Département *
                </label>
                <select 
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                >
                  <option value="">Sélectionnez un département</option>
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none resize-none"
                  placeholder="Description des responsabilités..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Salaire Minimum (€) *
                  </label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={formData.minimumSalary}
                    onChange={(e) => setFormData({...formData, minimumSalary: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Salaire Maximum (€) *
                  </label>
                  <input 
                    type="number"
                    required
                    min={formData.minimumSalary || 0}
                    value={formData.maximumSalary}
                    onChange={(e) => setFormData({...formData, maximumSalary: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="active-toggle"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <label htmlFor="active-toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Poste actif (ouvert au recrutement)
                </label>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 text-slate-500 font-bold text-xs hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  {currentPosition ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-slate-500 mb-6">
              Êtes-vous sûr de vouloir supprimer le poste <span className="font-bold text-slate-700">{currentPosition?.title}</span> ? Cette action est irréversible.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 text-slate-600 font-bold text-xs hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
