const express = require("express"); 
const mongoose = require("mongoose"); 
const cors = require("cors"); 
require("dotenv").config(); 

// Import des routes
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

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