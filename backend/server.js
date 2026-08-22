const express = require("express"); 
const mongoose = require("mongoose"); 
const cors = require("cors"); 
require("dotenv").config(); 
  
const app = express(); 
  
app.use(cors()); 
app.use(express.json()); 
  
app.get("/", (req, res) => { 
  res.json({ message: "API Gestion RH MERN fonctionne" }); 
}); 
  
mongoose 
  .connect(process.env.MONGO_URI) 
  .then(() => { 
console.log("MongoDB connecté"); 
  
    app.listen(process.env.PORT || 5000, () => { 
      console.log(`Serveur lancé sur le port ${process.env.PORT || 5000}`); 
    }); 
  }) 
  .catch((error) => { 
console.error("Erreur MongoDB :", error.message); 
  }); 