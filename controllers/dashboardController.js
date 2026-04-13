import Problem from "../models/problemSchema.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    // 🔥 GET USER FROM TOKEN
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 TOTAL PROBLEMS
    const totalProblems = await Problem.countDocuments();

    // 🔥 DIFFICULTY COUNT
    const difficultyStats = await Problem.aggregate([
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
        },
      },
    ]);

    // 🔥 FORMAT DIFFICULTY
    const difficultyMap = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    difficultyStats.forEach((item) => {
      difficultyMap[item._id] = item.count;
    });

    // 🔥 REAL SOLVED COUNT
    const solvedProblems = user.solvedProblems.length;

    // 🔥 PROGRESS %
    const percentage =
      totalProblems === 0
        ? 0
        : Math.round((solvedProblems / totalProblems) * 100);

    res.json({
      success: true,
      data: {
        totalProblems,
        solvedProblems,
        difficulty: difficultyMap,
        progress: {
          percentage,
        },
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};