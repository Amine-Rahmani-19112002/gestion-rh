import { Link } from "react-router-dom"; 
  
function Dashboard() { 
  return ( 
    <div style={{ padding: "40px" }}> 
      <h1>Dashboard RH</h1> 
      <p>Bienvenue dans l’application de gestion RH.</p> 
  
      <Link to="/employees"> 
        <button>Gestion des employés</button> 
      </Link> 
    </div> 
  ); 
} 
  
export default Dashboard; 