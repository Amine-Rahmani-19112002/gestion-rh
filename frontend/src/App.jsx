import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import Login from "./pages/login"; 
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; 
import Employees from "./pages/Employees"; 
import ProtectedRoute from "./ProtectedRoute"; // Correction du chemin

function App() { 
  return ( 
    <BrowserRouter> 
      <Routes> 

        {/* Routes Publiques */}
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes Protégées (Tous les utilisateurs connectés) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Routes Protégées (Administrateurs uniquement) */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/employees" element={<Employees />} />
        </Route>

        {/* Redirection par défaut si la route n'existe pas */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes> 
    </BrowserRouter> 
  ); 
} 

export default App;