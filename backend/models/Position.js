const mongoose = require("mongoose");
const positionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    minimumSalary: {
      type: Number,
      default: 0
    },
    maximumSalary: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);
module.exports =
  mongoose.model("Position", positionSchema);