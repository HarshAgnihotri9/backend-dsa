import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastSolvedDate: { type: Date, default: null },

  solvedProblems: [
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
    },
    difficulty: String,
    solvedAt: Date,
  },
]
  },
  
  { timestamps: true }
);

export default mongoose.model("User", userSchema);