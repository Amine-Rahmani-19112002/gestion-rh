import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CalendarX, Award, 
  UserPlus, CheckSquare, FilePlus, MoreHorizontal, Calendar, ArrowRight 
} from "lucide-react";
import api from "../api/axios";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupération des données du profil au chargement
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1500px]">
      
      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Total Employees</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">1,248</span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                +12
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Active Leaves</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">42</span>
              <span className="text-xs text-slate-400 font-medium">Today</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CalendarX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Pending Requests</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-slate-900">18</span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Requires Action
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Upcoming Evals</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">36</span>
              <span className="text-xs text-slate-400 font-medium">This Month</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ROW 2: Monthly Leave Trends & Team Absences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Monthly Leave Trends</h3>
            <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View Report <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-60 flex items-end justify-between gap-6 pt-6 px-4 border-b border-slate-100 relative">
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] font-medium text-slate-400">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
            </div>

            <div className="w-full pl-8 flex items-end justify-between h-full gap-4">
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-blue-100/70 rounded-t" style={{ height: "45%" }}></div>
                <span className="text-xs text-slate-400 font-medium">Jan</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-blue-100/70 rounded-t" style={{ height: "40%" }}></div>
                <span className="text-xs text-slate-400 font-medium">Feb</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-blue-100/70 rounded-t" style={{ height: "55%" }}></div>
                <span className="text-xs text-slate-400 font-medium">Mar</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-blue-100/70 rounded-t" style={{ height: "50%" }}></div>
                <span className="text-xs text-slate-400 font-medium">Apr</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-blue-100/70 rounded-t" style={{ height: "65%" }}></div>
                <span className="text-xs text-slate-400 font-medium">May</span>
              </div>
              <div className="w-full flex flex-col items-center gap-3">
                <div className="w-full bg-blue-600 rounded-t" style={{ height: "85%" }}></div>
                <span className="text-xs text-slate-400 font-medium">Jun</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Team Absences</h3>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-700">
                    SJ
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                    <p className="text-[11px] text-slate-400">Annual Leave</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">Jun 12-15</p>
                  <span className="text-[10px] font-bold text-emerald-600">Approved</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-700">
                    MC
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Marcus Chen</p>
                    <p className="text-[11px] text-slate-400">Sick Leave</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">Jun 14</p>
                  <span className="text-[10px] font-bold text-rose-500">Pending</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                    EL
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Elena Rossi</p>
                    <p className="text-[11px] text-slate-400">Maternity Leave</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">Ongoing</p>
                  <span className="text-[10px] font-bold text-emerald-600">Approved</span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-2 border border-slate-200 text-blue-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all mt-4">
            View Full Calendar
          </button>
        </div>
      </div>

      {/* ROW 3: Department Distribution, Quick Actions, Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Department Distribution</h3>
          
          <div className="flex justify-center items-center relative my-4">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-indigo-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600"
                strokeDasharray="45, 100"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray="30, 100"
                strokeDashoffset="-45"
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute text-center">
              <span className="text-2xl font-extrabold text-slate-900">8</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Depts</p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Engineering</span>
              <span className="font-semibold text-slate-600">45%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Sales</span>
              <span className="font-semibold text-slate-600">30%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-indigo-100"></span> Marketing</span>
              <span className="font-semibold text-slate-600">15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate("/employees")}
              className="p-4 bg-slate-100/60 hover:bg-blue-50 hover:text-blue-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">Add Employee</span>
            </button>

            <button 
              onClick={() => navigate("/leave")}
              className="p-4 bg-slate-100/60 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600">Approve Leave</span>
            </button>

            <button 
              onClick={() => navigate("/contracts")}
              className="p-4 bg-slate-100/60 hover:bg-cyan-50 hover:text-cyan-600 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <FilePlus className="w-5 h-5 text-slate-600" />
              <span className="text-xs font-bold text-slate-700 group-hover:text-cyan-600">New Contract</span>
            </button>

            <button 
              onClick={() => navigate("/settings")}
              className="p-4 bg-slate-100/60 hover:bg-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <MoreHorizontal className="w-5 h-5 text-slate-600" />
              <span className="text-xs font-bold text-slate-700">More Actions</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Recent Activity</h3>
          
          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0"></span>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">10 mins ago</p>
                <p className="text-slate-900 font-bold">Contract Signed - <span className="font-normal text-slate-600">Thomas Miller</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">2 hours ago</p>
                <p className="text-slate-900 font-bold">Leave Approved - <span className="font-normal text-slate-600">Sarah Jenkins</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-300 mt-1 shrink-0"></span>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Yesterday, 14:30</p>
                <p className="text-slate-900 font-bold">Evaluation Completed - <span className="font-normal text-slate-600">Design Team</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-300 mt-1 shrink-0"></span>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Yesterday, 09:15</p>
                <p className="text-slate-900 font-bold">New Employee Added - <span className="font-normal text-slate-600">Emily Chen</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;