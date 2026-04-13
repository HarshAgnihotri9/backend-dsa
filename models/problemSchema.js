import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      index: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    examples: [
      {
        input: String,
        output: String,
      },
    ],

    hints: [String],

    starterCode: {
      javascript: {
        type: String,
        default: "",
      },
    },

    testCases: [
      {
        input: {
          type: String,
          required: true,
        },
        expectedOutput: {
          type: String,
          required: true,
        },
        isHidden: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true, // 🔥 adds createdAt & updatedAt
  }
);

export default mongoose.model("Problem", problemSchema);