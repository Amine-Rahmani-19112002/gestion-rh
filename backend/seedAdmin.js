// Create a predefined admin user in the database if it doesn't exist
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existingAdmin = await User.findOne({
      email: "admin@rh.com",
    });
    if (existingAdmin) {
      console.log("L'administrateur existe déjà");
      return;
    }
    await User.create({
      name: "Admin RH",
      email: "admin@rh.com",
      password: "anwer123",
      role: "admin",
    });
    console.log("Administrateur créé avec succès");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};
createAdmin();