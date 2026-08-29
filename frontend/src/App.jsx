import { BrowserRouter, Routes, Route } from "react-router-dom"; 
import Login from "./pages/login"; 
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; 
import Employees from "./pages/Employees"; 
  
function App() { 
  return ( 
    <BrowserRouter> 
      <Routes> 
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path = "/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/employees" element={<Employees />} /> 
      </Routes> 
    </BrowserRouter> 
  ); 
} 
export default App;