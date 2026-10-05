const express = require("express"); 
const mongoose = require("mongoose"); 
const cors = require("cors"); 
require("dotenv").config(); 

// Import des routes
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const absenceRoutes = require("./routes/absenceRoutes");
const pointageRoutes = require("./routes/pointageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const userRoutes = require("./routes/userRoutes");
const positionRoutes = require("./routes/positionRoutes");
const contractRoutes = require("./routes/contractRoutes");
const documentRoutes = require("./routes/documentRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

const app = express(); 

// 1. Middlewares globaux
app.use(cors()); 
app.use(express.json()); 

// 2. Déclaration des routes
app.get("/", (req, res) => { 
  res.json({ message: "API Gestion RH MERN fonctionne" }); 
}); 

app.use("/api/auth", authRoutes); 
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/absences", absenceRoutes);
app.use("/api/pointage", pointageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/evaluations", evaluationRoutes);
// 3. Connexion BDD et Lancement du serveur
const PORT = process.env.PORT || 5000;

mongoose 
  .connect(process.env.MONGO_URI) 
  .then(() => { 
    console.log("MongoDB connecté"); 
    
    app.listen(PORT, () => { 
      console.log(`Serveur lancé sur le port ${PORT}`); 
    }); 
  }) 
  .catch((error) => { 
    console.error("Erreur MongoDB :", error.message); 
  });