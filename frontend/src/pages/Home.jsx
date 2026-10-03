import React from 'react';
import { 
  Users, 
  Plane, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  PlayCircle,
  CheckCircle2,
  Building2,
  Mail,
  MapPin,
  ChevronRight,
  Monitor
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-blue-200">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 transition-all duration-300">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            {/* Logo */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              StratoxHR
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <a href="#fonctionnalites" className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
            <a href="#tarifs" className="hover:text-blue-600 transition-colors">Tarifs</a>
            <a href="#ressources" className="hover:text-blue-600 transition-colors">Ressources</a>
          </div>

          <div className="flex items-center gap-5">
            <a href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              SE CONNECTER
            </a>
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
        {/* Subtle animated background grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-multiply"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left Column */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
              <ShieldCheck className="w-4 h-4" /> Nouveauté 2024
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
              La gestion RH,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">enfin</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">accessible.</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
              Une plateforme intuitive qui simplifie votre quotidien, booste l'engagement de vos équipes et s'adapte à votre croissance. Conçue pour toutes les entreprises, sans frais cachés.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a href="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/20 active:scale-95">
                DÉMARRER GRATUITEMENT 🚀
              </a>
              <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:-translate-y-1 active:scale-95 group">
                VOIR LA DÉMO <PlayCircle className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Column (Images & Badges) */}
          <div className="relative group">
            {/* Background Blob/Gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/60 to-cyan-100/40 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:scale-105 group-hover:from-blue-200/60"></div>
            
            {/* Main App Mockup Placeholder */}
            <div className="relative bg-white p-2 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
              <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center relative border border-slate-100/50">
                {/* Simulated UI for Dashboard */}
                <div className="absolute inset-0 p-5 flex flex-col gap-5">
                  <div className="h-12 bg-white rounded-xl shadow-sm border border-slate-100 w-full flex items-center px-4 gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                     <div className="w-24 h-3 rounded-full bg-slate-100"></div>
                  </div>
                  <div className="flex gap-5 flex-1">
                    <div className="w-1/4 bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex flex-col gap-3">
                       <div className="w-full h-8 bg-slate-50 rounded-lg"></div>
                       <div className="w-full h-8 bg-slate-50 rounded-lg"></div>
                       <div className="w-full h-8 bg-slate-50 rounded-lg"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-5">
                      <div className="flex gap-5">
                        <div className="h-28 bg-white rounded-xl shadow-sm border border-slate-100 flex-1 p-4 flex flex-col justify-between">
                           <div className="w-10 h-10 rounded-full bg-blue-50"></div>
                           <div className="w-16 h-3 rounded-full bg-slate-200"></div>
                        </div>
                        <div className="h-28 bg-white rounded-xl shadow-sm border border-slate-100 flex-1 p-4 flex flex-col justify-between">
                           <div className="w-10 h-10 rounded-full bg-emerald-50"></div>
                           <div className="w-16 h-3 rounded-full bg-slate-200"></div>
                        </div>
                        <div className="h-28 bg-white rounded-xl shadow-sm border border-slate-100 flex-1 p-4 flex flex-col justify-between">
                           <div className="w-10 h-10 rounded-full bg-amber-50"></div>
                           <div className="w-16 h-3 rounded-full bg-slate-200"></div>
                        </div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center relative overflow-hidden">
                        <div className="w-40 h-40 rounded-full border-[12px] border-blue-500 border-t-cyan-300 transform rotate-45 group-hover:rotate-90 transition-transform duration-1000"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 animate-bounce-slow group-hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1">100%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">CONFORMITÉ ASSURÉE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGO BAND */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">
            ILS FONT CONFIANCE À L'EXCELLENCE
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
            {/* Placeholder Logos */}
            <div className="flex items-center gap-2 font-black text-2xl"><Building2 className="w-8 h-8"/> ALFA</div>
            <div className="flex items-center gap-2 font-black text-2xl"><TrendingUp className="w-8 h-8"/> NEXUS</div>
            <div className="flex items-center gap-2 font-black text-2xl"><Users className="w-8 h-8"/> VERTEX</div>
            <div className="flex items-center gap-2 font-black text-2xl"><Monitor className="w-8 h-8"/> QUANTUM</div>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 items-center">
          <div className="lg:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plus de 500<br/>équipes agiles</h2>
            <p className="text-slate-400 font-medium">font confiance à Stratox HR pour simplifier leur gestion humaine au quotidien.</p>
          </div>
          
          <div className="text-center">
            <p className="text-5xl md:text-6xl font-bold mb-2">50k+</p>
            <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase">TALENTS GÉRÉS</p>
          </div>
          
          <div className="text-center">
            <p className="text-5xl md:text-6xl font-bold mb-2">99.9%</p>
            <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">FIABILITÉ</p>
          </div>

          <div className="text-center">
            <p className="text-5xl md:text-6xl font-bold mb-2">-30%</p>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">TEMPS ADMIN</p>
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="fonctionnalites" className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Tout ce qu'il vous faut<br/>pour réussir
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Une suite d'outils simples et efficaces, conçue pour offrir une expérience fluide et intuitive à toutes vos équipes, sans complexité inutile.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 auto-rows-[320px]">
            
            {/* Card 1: Annuaire (White) */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Annuaire Centralisé</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  L'information structurée, enfin. Naviguez dans un trombinoscope élégant et retrouvez instantanément les profils, compétences et données clés de votre organisation.
                </p>
              </div>
            </div>

            {/* Card 2: Image Dashboard */}
            <div className="bg-slate-200 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
               {/* Dashboard Mockup Pattern */}
               <div className="absolute inset-0 bg-white m-6 rounded-xl shadow-md border border-slate-100/50 overflow-hidden flex flex-col group-hover:scale-105 transition-transform duration-500">
                  <div className="h-8 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-3 flex-1 bg-white">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="bg-slate-50 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center p-2 group-hover:bg-blue-50/30 transition-colors">
                         <div className="w-10 h-10 rounded-full bg-slate-200 mb-2"></div>
                         <div className="w-16 h-2 bg-slate-200 rounded-full mb-1"></div>
                         <div className="w-10 h-2 bg-slate-100 rounded-full"></div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Card 3: Absences (Blue) */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-8 shadow-xl shadow-blue-600/20 flex flex-col justify-between text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-600/30 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white mb-6 backdrop-blur-sm group-hover:rotate-12 transition-transform">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Gestion des<br/>Absences</h3>
                <p className="text-blue-100 font-medium text-sm leading-relaxed mb-8">
                  Des workflows de validation transparents et un calendrier unifié pour une visibilité totale.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 relative z-10 group-hover:bg-white/20 transition-colors">
                 <div className="flex justify-between items-center text-sm font-bold mb-2">
                   <span>CONGÉS PAYÉS</span>
                   <span className="bg-white text-blue-600 px-2 py-0.5 rounded-md text-xs shadow-sm">15 jours</span>
                 </div>
                 <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                   <div className="w-2/3 h-full bg-white rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Card 4: Documentaire (Dark) */}
            <div className="bg-slate-900 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between text-white md:col-span-1 group hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform relative z-10">
                <FileText className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">Gestion Documentaire</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  Sécurisez vos contrats et documents légaux. Signature électronique intégrée et archivage à valeur probante, le tout dans un coffre-fort numérique inviolable.
                </p>
              </div>
            </div>

            {/* Card 5: Performance (Wide White) */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:col-span-2 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
              <div className="md:w-3/5 z-10 relative">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Performance & Objectifs</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Réussissez vos campagnes d'évaluation, définissez des OKR clairs et suivez la montée en compétences de vos talents grâce à des analytics précis et magnifiquement conçus.
                </p>
              </div>
              
              {/* Graphic Element */}
              <div className="absolute bottom-0 right-8 flex items-end gap-3 opacity-90">
                <div className="w-16 h-12 bg-blue-100 rounded-t-xl group-hover:h-16 transition-all duration-500"></div>
                <div className="w-16 h-24 bg-blue-300 rounded-t-xl group-hover:h-32 transition-all duration-500 delay-75"></div>
                <div className="w-16 h-32 bg-blue-500 rounded-t-xl group-hover:h-40 transition-all duration-500 delay-150"></div>
                <div className="w-16 h-40 bg-blue-600 rounded-t-xl group-hover:h-48 transition-all duration-500 delay-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ONBOARDING / STEPS SECTION */}
      <section className="py-32 bg-white overflow-hidden relative">
        <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-slate-100 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
          
          {/* Left: Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-slate-100 rounded-[3rem] translate-x-6 translate-y-6 -z-10 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
            <div className="bg-white border-[8px] border-white shadow-2xl rounded-[3rem] overflow-hidden aspect-square relative group-hover:-translate-y-2 group-hover:shadow-3xl transition-all duration-500">
               {/* Placeholder for the Laptop Image */}
               <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center">
                  {/* Mockup of laptop screen */}
                  <div className="w-[85%] h-[60%] mt-8 bg-white rounded-t-2xl shadow-lg border-t-8 border-x-8 border-slate-800 flex flex-col overflow-hidden relative">
                       <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-800"></div>
                       <div className="flex-1 p-4 grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors duration-500"></div>
                          <div className="bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors duration-500"></div>
                          <div className="bg-slate-100 rounded-lg col-span-2 group-hover:bg-blue-100 transition-colors duration-500"></div>
                       </div>
                  </div>
                  {/* Laptop base */}
                  <div className="h-6 bg-slate-300 w-[95%] relative rounded-b-3xl border-b-4 border-slate-400">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-2 bg-slate-400 rounded-b-xl"></div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Content & Steps */}
          <div>
            <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs tracking-widest uppercase rounded-full mb-6">
              PRÊT EN 5 MINUTES
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Commencez à gérer vos RH dès aujourd'hui
            </h2>
            <p className="text-lg text-slate-500 font-medium mb-12">
              Oubliez les déploiements complexes. Notre méthodologie d'onboarding vous garantit une adoption immédiate et un ROI mesurable en quelques semaines.
            </p>

            <div className="space-y-10">
              {/* Step 1 */}
              <div className="flex gap-6 group cursor-pointer">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg group-hover:border-blue-600 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-sm">
                  01
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Migration Intelligente</h4>
                  <p className="text-slate-500 font-medium">Nos algorithmes structurent et nettoient vos données historiques lors de l'import, garantissant une base saine dès le premier jour.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 group cursor-pointer">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg group-hover:border-blue-600 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-sm">
                  02
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Design System Cohérent</h4>
                  <p className="text-slate-500 font-medium">Une interface dont l'ergonomie a été pensée pour réduire le temps d'apprentissage à zéro. Vos équipes l'adopteront instantanément.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 group cursor-pointer">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                  03
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Pilotage Stratégique</h4>
                  <p className="text-slate-500 font-medium">Passez de l'opérationnel au stratégique avec nos tableaux de bord décisionnels propulsés par l'intelligence artificielle.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-16">
            
            {/* Brand Col */}
            <div className="col-span-2 md:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    StratoxHR
                  </span>
                </div>
                <p className="text-slate-500 font-medium text-sm pr-12 leading-relaxed">
                  La plateforme RH qui simplifie la vie des entreprises, en alliant outils intuitifs et accessibilité pour tous.
                </p>
              </div>
              
              <div className="flex gap-4 mt-8">
                 <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-900 transition-colors">
                   <Users className="w-4 h-4" />
                 </button>
                 <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-900 transition-colors">
                   <Users className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* Links Cols */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Produit</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Tarifs</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Sécurité & Conformité</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Cas d'usage</a></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Ressources</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Académie Stratox</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">API Developer</a></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4">
              <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Bureaux</h4>
              <address className="not-italic text-slate-500 font-medium text-sm space-y-2">
                <p>Paris, 75008</p>
                <p>Avenue des Champs-Élysées</p>
                <p className="pt-4 flex items-center gap-2"><Mail className="w-4 h-4" /> contact@stratox-hr.com</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> +33 1 84 25 36 90</p>
              </address>
            </div>

          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-medium">
              © {new Date().getFullYear()} Stratox HR Partners. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-slate-400 text-xs font-medium">
              <a href="#" className="hover:text-slate-600 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Politique de Confidentialité</a>
              <a href="#" className="hover:text-slate-600 transition-colors">CGU Premium</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}