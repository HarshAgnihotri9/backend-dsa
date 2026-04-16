import Problem from "../models/problemSchema.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Fetch user
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // 🚀 PARALLEL DB CALLS
    // =========================
    const [totalProblems, difficultyStats, rankCount] = await Promise.all([
      Problem.countDocuments(),

      Problem.aggregate([
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
          },
        },
      ]),

      User.countDocuments({
        points: { $gt: user.points || 0 },
      }),
    ]);

    // =========================
    // 🔥 DIFFICULTY MAP
    // =========================
    const difficultyMap = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    difficultyStats.forEach((item) => {
      if (difficultyMap[item._id] !== undefined) {
        difficultyMap[item._id] = item.count;
      }
    });

    // =========================
    // 🔥 USER STATS
    // =========================
    const solvedCount = user.solvedProblems?.length || 0;

    const progress =
      totalProblems === 0
        ? 0
        : Math.round((solvedCount / totalProblems) * 100);

    // =========================
    // 🔥 TODAY STATUS
    // =========================
    const today = new Date().toDateString();

    const lastDate = user.lastSolvedDate
      ? new Date(user.lastSolvedDate).toDateString()
      : null;

    const solvedToday = lastDate === today;

    // =========================
    // 🔥 ACTIVITY MAP (IMPORTANT 🔥)
    // =========================
    const activityMap = {};

    (user.solvedProblems || []).forEach((p) => {
      if (!p.solvedAt) return;

      const date = new Date(p.solvedAt)
        .toLocaleDateString("en-CA"); // YYYY-MM-DD

      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    // =========================
    // 🔥 RECENT SUBMISSIONS
    // =========================
  const recentSubmissions = await Promise.all(
  (user.solvedProblems || [])
    .slice(-5)
    .reverse()
    .map(async (p) => {
      const problem = await Problem.findById(p.problemId).lean();

      return {
        title: problem?.title || "Unknown Problem",
        difficulty: p.difficulty,
        time: p.solvedAt,
      };
    })
);
    // =========================
    // 🏆 RANK
    // =========================
    const rank = rankCount + 1;

    // =========================
    // 🚀 RESPONSE
    // =========================
    res.status(200).json({
      success: true,
      data: {
        // 📊 Stats
        totalProblems,
        solvedProblems: solvedCount,
        difficulty: difficultyMap,
        progress: {
          percentage: progress,
        },

        // 🔥 Gamification
        points: user.points || 0,
        streak: user.streak || 0,
        solvedToday,
        rank,
        user: {
  name: user.name,
  username: user.email,
},

        // 🧾 Recent
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};