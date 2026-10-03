import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Star, Sparkles } from "lucide-react";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Erreur lors de la connexion"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased selection:bg-blue-200 overflow-hidden">
      
      {/* LEFT PANEL : Ultra Premium Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-14 animate-gradient-x bg-gradient-to-br from-slate-900 via-[#0A1628] to-slate-900">
        
        {/* Dynamic Glowing Mesh */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/40 blur-[120px] animate-float"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/30 blur-[140px] animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 blur-[100px] animate-pulse"></div>
        </div>
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0 pointer-events-none"></div>

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in-up">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/10">
            <span className="text-white font-extrabold text-2xl">S</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            Stratox<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">HR</span>
          </span>
        </div>

        {/* Middle: Value Prop */}
        <div className="relative z-10 max-w-lg mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-4 h-4" /> Plateforme Next-Gen
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            L'excellence RH, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
              sans compromis.
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Une expérience unifiée et intelligente pour libérer le potentiel de vos équipes et sécuriser vos données stratégiques.
          </p>
        </div>

        {/* Bottom: Testimonial/Trust */}
        <div className="relative z-10 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-lg shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="absolute top-0 right-0 p-6 opacity-20">
             <ShieldCheck className="w-24 h-24 text-blue-400" />
          </div>
          <div className="flex gap-1.5 mb-5 relative z-10">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-md" />)}
          </div>
          <p className="text-slate-200 font-medium leading-relaxed mb-6 relative z-10 text-[15px]">
            "L'interface est si intuitive que nos collaborateurs l'ont adoptée le premier jour. Le temps passé sur la gestion administrative a fondu de 60%."
          </p>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-tr from-slate-200 to-white rounded-full border-2 border-white/20 shadow-inner flex items-center justify-center text-slate-800 font-bold">
               MD
            </div>
            <div>
              <p className="text-white font-bold text-sm">Marie Dubois</p>
              <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mt-0.5">DRH, TechFlow</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL : Refined Glassmorphic Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Soft background radial glows for depth */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-50/50 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="w-full max-w-[440px]">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-12 animate-fade-in-up">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              StratoxHR
            </span>
          </div>

          <div className="text-center lg:text-left mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Bienvenue 👋
            </h2>
            <p className="text-slate-500 font-medium text-base">
              Connectez-vous pour accéder à votre espace sécurisé.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              {error}
            </div>
          )}

          {/* Frosted Glass Form Card */}
          <div className="bg-white/70 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2.5 transition-colors group-focus-within:text-blue-600">
                  Adresse e-mail professionnelle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all sm:text-sm shadow-sm inset-shadow-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="block text-sm font-bold text-slate-700 transition-colors group-focus-within:text-blue-600">
                    Mot de passe
                  </label>
                  <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all sm:text-sm shadow-sm inset-shadow-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="relative w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all active:scale-[0.98] overflow-hidden group shadow-[0_10px_30px_-10px_rgba(15,23,42,0.5)]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-shimmer skew-x-12"></div>
                  <span className="relative z-10">Connexion sécurisée</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-slate-400 font-bold uppercase tracking-wider text-xs">Ou continuer avec</span>
                </div>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 text-sm font-bold text-slate-700 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.78 15.74 17.55V20.31H19.3C21.38 18.39 22.56 15.58 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.3 20.31L15.74 17.55C14.75 18.21 13.48 18.6 12 18.6C9.13 18.6 6.7 16.66 5.82 14.07H2.15V16.92C3.96 20.52 7.68 23 12 23Z" fill="#34A853"/>
                  <path d="M5.82 14.07C5.59 13.41 5.47 12.72 5.47 12C5.47 11.28 5.59 10.59 5.82 9.93V7.08H2.15C1.41 8.56 1 10.24 1 12C1 13.76 1.41 15.44 2.15 16.92L5.82 14.07Z" fill="#FBBC05"/>
                  <path d="M12 5.4C13.62 5.4 15.06 5.96 16.2 7.05L19.38 3.87C17.45 2.07 14.96 1 12 1C7.68 1 3.96 3.48 2.15 7.08L5.82 9.93C6.7 7.34 9.13 5.4 12 5.4Z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-3 w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 text-sm font-bold text-slate-700 transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.53 11.53 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16L15.5 15H13V21.95C18.05 21.45 22 17.19 22 12Z" fill="#1877F2"/>
                </svg>
                Microsoft
              </button>
            </div>
          </div>
          
          <p className="mt-6 text-center text-sm font-medium text-slate-600 animate-fade-in-up">
            Pas encore de compte ?{" "}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors underline decoration-blue-300 underline-offset-4 hover:decoration-blue-600">
              Créer un compte
            </Link>
          </p>

          <p className="mt-4 text-center text-xs font-medium text-slate-400 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Un problème d'accès ?{" "}
            <a href="#" className="font-bold text-slate-600 hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-4 hover:decoration-blue-600">
              Contacter le support IT
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;