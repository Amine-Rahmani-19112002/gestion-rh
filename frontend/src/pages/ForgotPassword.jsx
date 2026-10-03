import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import api from "../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Une erreur est survenue lors de l'envoi du lien de réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans antialiased relative overflow-hidden">
      
      {/* Background radial glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] bg-blue-100/50 rounded-full blur-[110px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] bg-cyan-100/40 rounded-full blur-[110px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/20 text-white font-extrabold text-2xl mb-4">
            S
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Stratox<span className="text-blue-600">HR</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Récupération de compte sécurisée
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)]">
          
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4 animate-fade-in-up">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                E-mail expédié !
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Si un compte est associé à l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation sécurisé valable <strong>60 minutes</strong>.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 text-left space-y-1">
                <p className="font-bold text-slate-700">Vous ne recevez rien ?</p>
                <p>• Vérifiez votre dossier de courriers indésirables (spams).</p>
                <p>• Assurez-vous d'avoir saisi votre adresse professionnelle exacte.</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Mot de passe oublié ?
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Saisissez l'adresse e-mail professionnelle liée à votre compte. Nous vous enverrons un lien à usage unique pour en définir un nouveau.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Adresse e-mail professionnelle
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="nom@entreprise.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span>Envoi du lien...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Envoyer le lien de réinitialisation</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Retour à la page de connexion
                  </Link>
                </div>
              </form>
            </div>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          StratoxHR © {new Date().getFullYear()} — Solution RH Sécurisée
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;
