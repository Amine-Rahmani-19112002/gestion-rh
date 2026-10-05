import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Leave from "./pages/Leave";
import ProtectedRoute from "../src/ProtectedRoute";
import Layout from "../src/Components/Layout";
import Absences from "./pages/Absences";
import ActivateAccount from "./pages/ActivateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Suggestions from "./pages/Suggestions";
import Contracts from "./pages/Contracts";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import Positions from "./pages/Positions";
import Departments from "./pages/Departments";
import Evaluations from "./pages/Evaluations";


function App() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:token" element={<ActivateAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Routes Protégées Tout Utilisateur (Collaborateurs & Admin) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaves" element={<Leave/>} />
            <Route path="/absences" element={<Absences />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Routes Protégées Admin Uniquement */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<Layout />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/positions" element={<Positions />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/evaluations" element={<Evaluations />} />
            <Route path="/documents" element={<Documents />} />
          </Route>
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;