import Problem from "../models/problemSchema.js";

// CREATE PROBLEM
export const createProblem = async (req, res) => {
  try {
    const data = req.body;

    // generate slug
    const slug = data.title.toLowerCase().replace(/\s+/g, "-");

    const problem = await Problem.create({
      ...data,
      slug,
    });

    res.status(201).json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET SINGLE PROBLEM (by slug)
export const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({
      slug: req.params.slug,
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};