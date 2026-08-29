const User = require("../models/User"); 
const jwt = require("jsonwebtoken");

const generateToken = (user) => { 
  return jwt.sign( 
    {
      /* Payload of the JWT token, containing user information that 
      can be used for authentication and authorization. */
      id: user._id, 
      role: user.role, 
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: "7d", 
    } 
  ); 
}; 

const login = async (req, res) => { 
  try { 
    const { email, password } = req.body; 
    
  
    if (!email || !password) { 
      return res.status(400).json({ 
        message: "Email et mot de passe obligatoires", 
      }); 
    } 
  
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
    }); 
  
    if (!user) { 
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect", 
      }); 
    } 
  
    const isMatch = await user.matchPassword(password); 
  
    if (!isMatch) { 
      return res.status(401).json({ 
        message: "Email ou mot de passe incorrect", 
      });
         } 
  
    return res.status(200).json({ 
      message: "Connexion réussie", 
      token: generateToken(user), 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        employee: user.employee,
      }, 
    }); 
  } catch (error) { 
    return res.status(500).json({ 
      message: "Erreur serveur lors de la connexion", 
      error: error.message, 
    }); 
  } 
}; 

const getProfile = async (req, res) => { 
  try { 
    /*Retrieve the authenticated user's profile information from the database, 
    excluding the password field for security reasons.*/
    const user = await User.findById(req.user.id).select("-password"); 
  
    if (!user) { 
      return res.status(404).json({ 
        message: "Utilisateur introuvable", 
      }); 
    } 
  
    return res.status(200).json(user); 
  } catch (error) { 
    return res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message, 
    }); 
  } 
}; 
  
module.exports = { 
  login, 
  getProfile, 
};