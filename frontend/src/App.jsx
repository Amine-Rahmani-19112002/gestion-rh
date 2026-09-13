import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Leave from "./pages/Leave";
import ProtectedRoute from "../src/ProtectedRoute";
import Layout from "./components/Layout";

const Departments = () => <div className="p-4 bg-white rounded-xl">Page Departments</div>;
const Contracts = () => <div className="p-4 bg-white rounded-xl">Page Contracts</div>;
const Evaluations = () => <div className="p-4 bg-white rounded-xl">Page Evaluations</div>;
const Documents = () => <div className="p-4 bg-white rounded-xl">Page Documents</div>;
const Settings = () => <div className="p-4 bg-white rounded-xl">Page Settings</div>;

function App() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes Protégées Tout Utilisateur */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaves" element={<Leave/>} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/evaluations" element={<Evaluations />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Routes Protégées Admin Uniquement */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<Layout />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
          </Route>
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;