import Problem from "../models/problemSchema.js";
import User from "../models/User.js";
export const runCode = async (req, res) => {
  const { code, slug } = req.body;

  try {
    const problem = await Problem.findOne({ slug });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }
    

    // 🔥 EXTRACT FUNCTION NAME FROM USER CODE
    const functionMatch = code.match(/function\s+([a-zA-Z0-9_]+)/);

    if (!functionMatch) {
      return res.status(400).json({
        success: false,
        errorType: "Compilation Error",
        message: "No function found in code",
      });
    }

    const functionName = functionMatch[1];

    let results = [];
    let allPassed = true;

    for (let test of problem.testCases) {
      try {
        const input = JSON.parse(test.input);

        const userFunction = new Function(
          "input",
          `
          ${code}
          return ${functionName}(...Object.values(input));
          `
        );

        const output = userFunction(input);
        const expected = JSON.parse(test.expectedOutput);

        const passed =
          JSON.stringify(output) === JSON.stringify(expected);

        if (!passed) allPassed = false;

        results.push({
          input,
          expected,
          output,
          passed,
        });
        if (allPassed) {
          await User.findByIdAndUpdate(
            req.user.id,
            {
              $addToSet: { // 🔥 prevents duplicates
                solvedProblems: problem._id,
              },
            },
            { new: true }
          );
        }

      } catch (err) {
        return res.status(400).json({
          success: false,
          errorType:
            err instanceof SyntaxError
              ? "Compilation Error"
              : "Runtime Error",
          message: err.message,
        });
      }
    }

    return res.json({
      success: allPassed,
      results,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      errorType: "Server Error",
      message: error.message,
    });
  }
};




export const submitSolution = async (req, res) => {
  try {
    const { problemId } = req.body;
    const userId = req.user?.id;

    // ✅ Validate input
    if (!problemId) {
      return res.status(400).json({ message: "Problem ID is required" });
    }

    // ✅ Fetch user & problem
    const user = await User.findById(userId);
    const problem = await Problem.findById(problemId);

    if (!user || !problem) {
      return res.status(404).json({ message: "User or Problem not found" });
    }

    // =========================
    // ✅ CHECK: already solved (SAFE)
    // =========================
    const alreadySolved = user.solvedProblems.find(
      (p) =>
        p.problemId &&
        p.problemId.toString() === problemId.toString()
    );

    if (alreadySolved) {
      return res.status(400).json({ message: "Already solved" });
    }

    // =========================
    // 🔥 POINTS LOGIC
    // =========================
    const pointsMap = {
      easy: 10,
      medium: 20,
      hard: 40,
    };

    let earnedPoints = pointsMap[problem.difficulty] || 0;

    // =========================
    // 🔥 STREAK LOGIC
    // =========================
    const today = new Date().toDateString();

    const lastDate = user.lastSolvedDate
      ? new Date(user.lastSolvedDate).toDateString()
      : null;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let alreadySolvedToday = lastDate === today;

    if (!alreadySolvedToday) {
      if (lastDate === yesterday.toDateString()) {
        user.streak += 1; // continue streak
      } else {
        user.streak = 1; // reset streak
      }

      user.lastSolvedDate = new Date();

      // 🎁 first problem of the day bonus
      earnedPoints += 5;
    }

    // =========================
    // 🧠 SAVE SOLUTION
    // =========================
    user.solvedProblems.push({
      problemId: problem._id, // ✅ ALWAYS use _id from DB
      difficulty: problem.difficulty,
      solvedAt: new Date(),
    });

    user.points += earnedPoints;

    await user.save();

    // =========================
    // ✅ RESPONSE
    // =========================
    res.status(200).json({
      message: "Solution submitted successfully",
      earnedPoints,
      totalPoints: user.points,
      streak: user.streak,
    });

  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};