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