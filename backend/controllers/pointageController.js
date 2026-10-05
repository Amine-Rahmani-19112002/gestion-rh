const Pointage = require("../models/Pointage");

// Configuration (Normalement dans .env)
const ALLOWED_IPS = ["::1", "127.0.0.1", "::ffff:127.0.0.1"];
// Centre de Paris (exemple pour test)
const OFFICE_LOCATION = { lat: 48.8566, lng: 2.3522 };
const MAX_RADIUS_KM = 1000; // Rayon très large pour faciliter les tests (1000km)

// Calcul de distance (Haversine)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la terre en km
  const dLat = deg2rad(lat2 - lat1);  
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// @desc    Créer un pointage d'arrivée (Clock In)
// @route   POST /api/pointage/clock-in
// @access  Private
exports.clockIn = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // Obtenir l'IP
    const ipAddress = req.ip || req.connection.remoteAddress;

    let isAnomalie = false;
    let anomalieDetails = [];

    // 1. Vérification IP
    if (!ALLOWED_IPS.includes(ipAddress)) {
       isAnomalie = true;
       anomalieDetails.push(`IP non autorisée (${ipAddress})`);
    }

    // 2. Vérification Géolocalisation
    if (lat && lng) {
       const distance = getDistanceFromLatLonInKm(lat, lng, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
       if (distance > MAX_RADIUS_KM) {
         isAnomalie = true;
         anomalieDetails.push(`Hors zone géographique (Dist: ${distance.toFixed(1)}km)`);
       }
    } else {
       isAnomalie = true;
       anomalieDetails.push("Géolocalisation manquante");
    }

    // Vérifier s'il a déjà pointé aujourd'hui
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const existingPointage = await Pointage.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingPointage && existingPointage.clockInTime) {
       return res.status(400).json({ message: "Pointage d'arrivée déjà effectué aujourd'hui." });
    }

    let pointageToSave;

    if (existingPointage) {
       // Si une entrée existe déjà (ex: créée par un autre script), on met à jour
       existingPointage.clockInTime = Date.now();
       existingPointage.ipAddress = ipAddress;
       existingPointage.location = { lat, lng };
       existingPointage.status = isAnomalie ? "Anomalie" : "En ligne";
       existingPointage.anomalieDetails = anomalieDetails.join(", ");
       pointageToSave = await existingPointage.save();
    } else {
       // Création
       pointageToSave = await Pointage.create({
         user: req.user._id,
         clockInTime: Date.now(),
         ipAddress: ipAddress,
         location: { lat, lng },
         status: isAnomalie ? "Anomalie" : "En ligne",
         anomalieDetails: anomalieDetails.join(", ")
       });
    }

    res.status(201).json(pointageToSave);

  } catch (error) {
    console.error("Erreur clockIn:", error);
    res.status(500).json({ message: "Erreur serveur lors du pointage." });
  }
};

// @desc    Pointage de départ (Clock Out)
// @route   POST /api/pointage/clock-out
// @access  Private
exports.clockOut = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const pointage = await Pointage.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!pointage) {
      return res.status(404).json({ message: "Aucun pointage trouvé pour aujourd'hui." });
    }

    if (pointage.clockOutTime) {
      return res.status(400).json({ message: "Pointage de départ déjà effectué." });
    }

    pointage.clockOutTime = Date.now();
    pointage.status = "Terminé";
    await pointage.save();

    res.status(200).json(pointage);
  } catch (error) {
    console.error("Erreur clockOut:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// @desc    Mettre à jour le statut (Actif / Inactif)
// @route   POST /api/pointage/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!["En ligne", "Inactif"].includes(status)) {
       return res.status(400).json({ message: "Statut invalide" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const pointage = await Pointage.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      clockOutTime: null // Seulement si la journée n'est pas terminée
    });

    if (pointage) {
       // On ne change pas le statut s'il est en "Anomalie" pour ne pas écraser l'alerte
       if (pointage.status !== "Anomalie") {
         pointage.status = status;
         await pointage.save();
       }
       return res.status(200).json(pointage);
    }

    res.status(404).json({ message: "Aucun pointage actif." });
  } catch (error) {
    console.error("Erreur updateStatus:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// @desc    Obtenir le pointage du jour pour l'utilisateur
// @route   GET /api/pointage/me
// @access  Private
exports.getMyPointage = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const pointage = await Pointage.findOne({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.status(200).json(pointage || { status: "Non pointé" });
  } catch (error) {
    console.error("Erreur getMyPointage:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getMyPointageHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.user._id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const pointages = await Pointage.find(filter)
      .sort({ date: -1 })
      .limit(60);
    
    // Calculate stats
    const totalDays = pointages.length;
    const lateCount = pointages.filter(p => {
      if (!p.clockInTime) return false;
      const clockIn = new Date(p.clockInTime);
      return clockIn.getHours() > 9 || (clockIn.getHours() === 9 && clockIn.getMinutes() > 0);
    }).length;
    const anomalies = pointages.filter(p => p.status === 'Anomalie').length;
    const avgHours = pointages.reduce((acc, p) => {
      if (p.clockInTime && p.clockOutTime) {
        const diff = new Date(p.clockOutTime) - new Date(p.clockInTime);
        return acc + diff / (1000 * 60 * 60);
      }
      return acc;
    }, 0) / (totalDays || 1);
    
    res.status(200).json({
      pointages,
      stats: {
        totalDays,
        lateCount,
        anomalies,
        avgHours: Math.round(avgHours * 10) / 10,
        onTimeRate: totalDays > 0 ? Math.round(((totalDays - lateCount) / totalDays) * 100) : 100
      }
    });
  } catch (error) {
    console.error('Erreur getMyPointageHistory:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

exports.getAllPointages = async (req, res) => {
  try {
    const pointages = await Pointage.find()
      .populate('user', 'name email role')
      .sort({ date: -1 })
      .limit(200);
    res.status(200).json(pointages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
