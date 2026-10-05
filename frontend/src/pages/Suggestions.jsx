import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useOutletContext } from 'react-router-dom';
import { 
  Lightbulb, 
  ThumbsUp, 
  MessageSquare, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  Users, 
  Zap, 
  Filter,
  X
} from 'lucide-react';

const CATEGORIES = ['Toutes', 'Bien-être & QVT', 'Écologie & RSE', 'Amélioration process', "Vie d'entreprise", 'Formation', 'Autre'];

const Suggestions = () => {
  const { profile } = useOutletContext();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterCat, setFilterCat] = useState('Toutes');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ titre: '', description: '', categorie: 'Autre' });
  
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suggestions');
      setSuggestions(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleVote = async (id) => {
    try {
      const res = await api.post(`/suggestions/${id}/vote`);
      setSuggestions(suggestions.map(s => s._id === id ? res.data : s));
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/suggestions', formData);
      setSuggestions([res.data, ...suggestions]);
      setShowModal(false);
      setFormData({ titre: '', description: '', categorie: 'Autre' });
    } catch (err) {
      console.error('Create error:', err);
    }
  };

  const filteredSuggestions = suggestions.filter(s => {
    const matchCat = filterCat === 'Toutes' || s.categorie === filterCat;
    const matchSearch = s.titre.toLowerCase().includes(search.toLowerCase()) || 
                        s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Adopté': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'En revue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Planifié': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Rejeté': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const currentMonth = new Date().getMonth();
  const monthSuggestions = suggestions.filter(s => new Date(s.createdAt).getMonth() === currentMonth).length;
  const inReviewCount = suggestions.filter(s => s.statut === 'En revue').length;
  const adoptedCount = suggestions.filter(s => s.statut === 'Adopté').length;
  const participationRate = 45;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold mb-3">
            <Zap size={12} />
            Innovation Participative
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Boîte à Idées & Suggestions</h1>
          <p className="text-sm text-slate-500">Exprimez vos idées pour améliorer notre quotidien et participez aux votes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 shadow-sm">
            Mes propositions : {suggestions.filter(s => s.auteur?._id === profile?._id).length}
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus size={16} />
            Proposer une idée
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Lightbulb size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Soumissions du mois</p>
            <p className="text-lg font-bold text-slate-900">{monthSuggestions}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">En revue Direction</p>
            <p className="text-lg font-bold text-slate-900">{inReviewCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Adoptées & Déployées</p>
            <p className="text-lg font-bold text-slate-900">{adoptedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Participation Salariés</p>
            <p className="text-lg font-bold text-slate-900">{participationRate}%</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex overflow-x-auto pb-1 md:pb-0 gap-2 px-2 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors border ${
                filterCat === cat 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative px-2 md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Rechercher une idée..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Chargement...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSuggestions.map(s => (
            <div key={s._id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {s.categorie}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(s.statut)}`}>
                    {s.statut}
                  </span>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              
              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{s.titre}</h3>
              <p className="text-xs text-slate-600 mb-4 line-clamp-2 flex-grow">{s.description}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-slate-500">Objectif de votes</span>
                  <span className="font-bold text-slate-700">{s.votesCount} / {s.seuilVotes}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${Math.min(100, (s.votesCount / s.seuilVotes) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    {s.auteurNom?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{s.auteurNom}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                    <MessageSquare size={14} />
                    {s.commentairesCount}
                  </div>
                  <button 
                    onClick={() => handleVote(s._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      s.votes.includes(profile?._id)
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <ThumbsUp size={14} className={s.votes.includes(profile?._id) ? "fill-current" : ""} />
                    {s.votesCount}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredSuggestions.length === 0 && (
            <div className="col-span-1 lg:col-span-2 text-center py-12 text-slate-500 text-sm">
              Aucune suggestion trouvée.
            </div>
          )}
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 mt-8 shadow-sm">
        <div>
          <h3 className="text-lg font-bold mb-1">Vous avez une idée pour simplifier le quotidien ?</h3>
          <p className="text-blue-100 text-sm">Toutes les propositions sont lues et étudiées par la direction.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm whitespace-nowrap transition-colors"
        >
          Rédiger un brouillon
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">Nouvelle Suggestion</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre de l'idée</label>
                <input
                  type="text"
                  required
                  value={formData.titre}
                  onChange={(e) => setFormData({...formData, titre: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  placeholder="Ex: Mise en place du tri sélectif..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Catégorie</label>
                <select
                  value={formData.categorie}
                  onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  {CATEGORIES.filter(c => c !== 'Toutes').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description détaillée</label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
                  placeholder="Expliquez votre idée, ses avantages, comment la mettre en place..."
                ></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Publier l'idée
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;
