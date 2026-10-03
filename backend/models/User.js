const mongoose = require("mongoose"); 
const bcrypt = require("bcryptjs"); 
const crypto = require("crypto");
  
const userSchema = new mongoose.Schema( 
  { 
    name: { 
      type: String, 
      required: true, 
      trim: true, 
    }, 
  
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true, 
    }, 
  
    password: { 
      type: String, 
      minlength: 6, 
      // Required once account is activated, but optional while in "pending" status
      default: null,
    }, 

    role: { 
      type: String, 
      enum: ["admin", "employe"], 
      default: "employe", 
    }, 

    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },

    activationToken: {
      type: String,
      default: null,
    },

    activationExpires: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  }, 
  { 
    timestamps: true, 
  } 
); 
  
// Encrypt password before saving to database if modified
userSchema.pre("save", async function () { 
  if (!this.isModified("password") || !this.password) 
    return; 
  
  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt); 
}); 
  
// Verify entered password with hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) { 
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password); 
};

// Generate and hash activation token (valid 48h)
userSchema.methods.createActivationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.activationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.activationExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
  return rawToken;
};

// Generate and hash password reset token (valid 1h)
userSchema.methods.createResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  return rawToken;
};
  
module.exports = mongoose.model("User", userSchema); 