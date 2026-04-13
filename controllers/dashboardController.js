import Problem from "../models/problemSchema.js";

export const getDashboard = async (req, res) => {
  try {
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

    // Convert to object
    const difficultyMap = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    difficultyStats.forEach((item) => {
      difficultyMap[item._id] = item.count;
    });

    // 🔥 TODO: Replace with DB later
    // For now using mock solved data
    const solvedProblems = 1;

    res.json({
      success: true,
      data: {
        totalProblems,
        solvedProblems,

        difficulty: difficultyMap,

        progress: {
          percentage:
            totalProblems === 0
              ? 0
              : Math.round((solvedProblems / totalProblems) * 100),
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