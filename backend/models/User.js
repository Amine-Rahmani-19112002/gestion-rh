const mongoose = require("mongoose"); 
const bcrypt = require("bcryptjs"); 
  
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
      required: true, 
      minlength: 6, 
    }, 
  
    role: { 
      type: String, 
      enum: ["admin", "employe"], 
      default: "employe", 
    }, 

    employee:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,

    },
  }, 
  { 
    timestamps: true, 
  } 
); 
  
// Encrypt password before saving to database 
// This middleware runs before saving a user document to the database.
/* next() is called to proceed with the save operation after 
the password has been hashed or if the password was not modified.*/
userSchema.pre("save", async function () { 
  if (!this.isModified("password")) 
    return; 
  
  
  // Salt : A random string added to the password before hashing to enhance security.
  const salt = await bcrypt.genSalt(10); 
  this.password = await bcrypt.hash(this.password, salt); 
  
}); 
  
// Verify entered password with hashed password in the database into login process
userSchema.methods.matchPassword = async function (enteredPassword) { 
  return bcrypt.compare(enteredPassword, this.password); 
}; 
  
module.exports = mongoose.model("User", userSchema); 