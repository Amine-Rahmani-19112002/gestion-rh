import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Lock, Eye, EyeOff, CheckCircle2, XCircle, 
  ArrowRight, AlertTriangle, KeyRound 
} from "lucide-react";
import api from "../api/axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/reset-password/${token}`);
        if (response.data.valid) {
          setTokenValid(true);
          setUserEmail(response.data.email);
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(
          err.response?.data?.message || 
          "Ce lien de réinitialisation est invalide ou a expiré."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setLoading(false);
      setTokenValid(false);
      setTokenError("Jeton de réinitialisation manquant.");
    }
  }, [token]);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isPasswordValid = 
    hasMinLength && 
    hasUppercase && 
    hasLowercase && 
    hasNumber && 
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!isPasswordValid) {
      setSubmitError("Veuillez respecter tous les critères de sécurité du mot de passe.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 
        "Une erreur est survenue lors de la réinitialisation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans antialiased relative overflow-hidden">
      
      {/* Background radial glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[550px] h-[550px] bg-blue-100/50 rounded-full blur-[110px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[550px] h-[550px] bg-indigo-100/40 rounded-full blur-[110px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-lg">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/20 text-white font-extrabold text-2xl mb-4">
            S
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Stratox<span className="text-blue-600">HR</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Nouveau mot de passe
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)]">
          
          {loading ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600 font-semibold text-sm">
                Vérification du lien sécurisé...
              </p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Lien invalide ou expiré
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">
                {tokenError}
              </p>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md"
                >
                  Demander un nouveau lien
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 text-slate-600 font-bold text-sm hover:underline"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-8 space-y-4 animate-fade-in-up">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Mot de passe mis à jour !
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">
                Votre nouveau mot de passe a été configuré avec succès. Vous pouvez à présent vous connecter avec vos nouveaux identifiants.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/25"
                >
                  Se connecter
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Définir un nouveau mot de passe
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Pour le compte : <strong className="text-slate-700">{userEmail}</strong>
                </p>
              </div>

              {submitError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirmez le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <KeyRound className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 mb-2">Exigences :</p>
                  
                  <div className={`flex items-center gap-2 ${hasMinLength ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                    {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300"></div>}
                    <span>Au moins 8 caractères</span>
                  </div>

                  <div className={`flex items-center gap-2 ${hasUppercase ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                    {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300"></div>}
                    <span>Au moins une lettre majuscule</span>
                  </div>

                  <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300"></div>}
                    <span>Au moins un chiffre</span>
                  </div>

                  <div className={`flex items-center gap-2 ${passwordsMatch ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                    {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300"></div>}
                    <span>Les mots de passe correspondent</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isPasswordValid || submitting}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl font-bold text-white transition-all shadow-md ${
                    isPasswordValid && !submitting
                      ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:-translate-y-0.5 cursor-pointer"
                      : "bg-slate-300 cursor-not-allowed shadow-none"
                  }`}
                >
                  {submitting ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <span>Valider mon nouveau mot de passe</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
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

export default ResetPassword;
